import { JsonRpcProvider, Contract } from 'ethers';
import axios from 'axios';
import { Asset, ChainType, BalanceResponse } from '@/types';
import { CHAINS } from './chains';
import { fetchPrice, fetchTokenInfo } from './price-service';
import { fetchTokenPriceFromDex } from './dex-price-service';

// ERC20 ABI for balance checking
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

// Fetch EVM chain balances (Ethereum, Polygon, BSC, etc.)
async function fetchEVMBalance(address: string, chain: ChainType): Promise<Asset[]> {
  const assets: Asset[] = [];
  const chainConfig = CHAINS[chain];

  try {
    if (!chainConfig.rpcUrl) return assets;

    console.log(`Fetching EVM balance for ${chain}:`, address);
    const provider = new JsonRpcProvider(chainConfig.rpcUrl);

    // Get native token balance (ETH, MATIC, BNB, etc.)
    const balance = await provider.getBalance(address);
    const nativeBalance = parseFloat(balance.toString()) / 1e18;

    if (nativeBalance > 0) {
      const price = await fetchPrice(chainConfig.symbol);
      assets.push({
        symbol: chainConfig.symbol,
        name: chainConfig.name,
        balance: nativeBalance,
        decimals: 18,
        price,
        value: nativeBalance * price,
        chain,
      });
    }

    // Get ERC20 token balances using Blockscout API (free, open source)
    console.log(`Fetching ERC20 tokens for ${chain}`);
    const explorerApiMap: Record<string, string> = {
      'base': 'https://base.blockscout.com/api',
      'ethereum': 'https://eth.blockscout.com/api',
      'polygon': 'https://polygon.blockscout.com/api',
      'optimism': 'https://optimism.blockscout.com/api',
      'arbitrum': 'https://arbitrum.blockscout.com/api',
    };

    const apiUrl = explorerApiMap[chain];
    if (apiUrl) {
      try {
        const tokenResponse = await axios.get(apiUrl, {
          params: {
            module: 'account',
            action: 'tokenlist',
            address: address,
          },
          timeout: 10000,
        });

        const tokens = tokenResponse.data?.result || [];
        console.log(`Found ${tokens.length} ERC20 tokens on ${chain}`);

        for (const token of tokens) {
          try {
            const tokenBalance = parseFloat(token.balance || '0') / Math.pow(10, parseInt(token.decimals || '18'));

            if (tokenBalance > 0) {
              // Fetch price from DexScreener (only for supported chains)
              const tokenData = chain !== 'bitcoin'
                ? await fetchTokenPriceFromDex(token.contractAddress, chain as any)
                : null;

              const symbol = token.symbol || token.name?.substring(0, 6) || 'UNKNOWN';
              const name = token.name || `Token ${symbol}`;
              const price = tokenData?.price || 0;
              const value = tokenBalance * price;

              console.log(`ERC20 Token: ${symbol}, Balance: ${tokenBalance}, Price: $${price}, Value: $${value}`);

              // Only include tokens worth more than $10
              if (value >= 10) {
                assets.push({
                  symbol: symbol.toUpperCase(),
                  name,
                  balance: tokenBalance,
                  decimals: parseInt(token.decimals || '18'),
                  price,
                  value,
                  chain,
                  contractAddress: token.contractAddress,
                });
              } else {
                console.log(`Skipping ${symbol} - value $${value.toFixed(2)} is below $10 threshold`);
              }
            }
          } catch (tokenError) {
            console.error('Error processing ERC20 token:', tokenError);
          }
        }
      } catch (apiError) {
        console.log(`Blockscout API not available for ${chain}, skipping ERC20 tokens`);
      }
    }

  } catch (error) {
    console.error(`Error fetching ${chain} balance:`, error);
  }

  return assets;
}

// Fetch Bitcoin balance
async function fetchBitcoinBalance(address: string): Promise<Asset[]> {
  const assets: Asset[] = [];

  try {
    // Using blockchain.info API (free, no auth required)
    const response = await axios.get(
      `https://blockchain.info/q/addressbalance/${address}`
    );

    const satoshis = parseInt(response.data);
    const balance = satoshis / 1e8; // Convert satoshis to BTC

    if (balance > 0) {
      const price = await fetchPrice('BTC');
      assets.push({
        symbol: 'BTC',
        name: 'Bitcoin',
        balance,
        decimals: 8,
        price,
        value: balance * price,
        chain: 'bitcoin',
      });
    }
  } catch (error) {
    console.error('Error fetching Bitcoin balance:', error);
  }

  return assets;
}

// Fetch Solana balance
async function fetchSolanaBalance(address: string): Promise<Asset[]> {
  const assets: Asset[] = [];

  try {
    console.log('Fetching Solana balance for:', address);

    // Get SOL balance
    const solResponse = await axios.post('https://api.mainnet-beta.solana.com', {
      jsonrpc: '2.0',
      id: 1,
      method: 'getBalance',
      params: [address],
    });

    const lamports = solResponse.data.result?.value || 0;
    const balance = lamports / 1e9;

    if (balance > 0) {
      const price = await fetchPrice('SOL');
      assets.push({
        symbol: 'SOL',
        name: 'Solana',
        balance,
        decimals: 9,
        price,
        value: balance * price,
        chain: 'solana',
      });
    }

    // Get SPL token balances
    console.log('Fetching SPL tokens for:', address);
    const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

    const tokenResponse = await axios.post('https://api.mainnet-beta.solana.com', {
      jsonrpc: '2.0',
      id: 1,
      method: 'getTokenAccountsByOwner',
      params: [
        address,
        { programId: TOKEN_PROGRAM_ID },
        { encoding: 'jsonParsed' }
      ],
    });

    const tokenAccounts = tokenResponse.data.result?.value || [];
    console.log(`Found ${tokenAccounts.length} SPL token accounts`);

    // Process each token account
    for (const account of tokenAccounts) {
      try {
        const parsedInfo = account.account.data.parsed.info;
        const tokenAmount = parsedInfo.tokenAmount;
        const mint = parsedInfo.mint;

        const tokenBalance = parseFloat(tokenAmount.uiAmountString || '0');

        if (tokenBalance > 0) {
          // Fetch price and metadata from DexScreener
          const tokenData = await fetchTokenPriceFromDex(mint, 'solana');

          const symbol = tokenData?.symbol || mint.substring(0, 8);
          const name = tokenData?.name || `Token ${symbol}`;
          const price = tokenData?.price || 0;
          const value = tokenBalance * price;

          console.log(`SPL Token: ${symbol}, Balance: ${tokenBalance}, Price: $${price}, Value: $${value}`);

          // Only include tokens worth more than $10
          if (value >= 10) {
            assets.push({
              symbol: symbol.toUpperCase(),
              name,
              balance: tokenBalance,
              decimals: tokenAmount.decimals,
              price,
              value,
              chain: 'solana',
              contractAddress: mint,
            });
          } else {
            console.log(`Skipping ${symbol} - value $${value.toFixed(2)} is below $10 threshold`);
          }
        }
      } catch (tokenError) {
        console.error('Error processing SPL token:', tokenError);
      }
    }

    console.log(`Found ${assets.length} total Solana assets (including SPL tokens)`);

  } catch (error) {
    console.error('Error fetching Solana balance:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data || error.message);
    }
  }

  return assets;
}

// Main function to fetch balances for any chain
export async function fetchWalletBalance(
  address: string,
  chain: ChainType
): Promise<BalanceResponse> {
  console.log(`[fetchWalletBalance] Fetching balance for ${chain} wallet: ${address}`);
  let assets: Asset[] = [];

  switch (chain) {
    case 'ethereum':
    case 'polygon':
    case 'bsc':
    case 'arbitrum':
    case 'optimism':
    case 'avalanche':
    case 'base':
      assets = await fetchEVMBalance(address, chain);
      break;

    case 'bitcoin':
      assets = await fetchBitcoinBalance(address);
      break;

    case 'solana':
      assets = await fetchSolanaBalance(address);
      break;

    default:
      console.warn(`Unsupported chain: ${chain}`);
  }

  console.log(`[fetchWalletBalance] Found ${assets.length} assets for ${chain}:`, assets);

  return {
    chain,
    address,
    assets,
  };
}

// Fetch balances for multiple wallets
export async function fetchAllBalances(
  wallets: { address: string; chain: ChainType }[]
): Promise<Asset[]> {
  const allAssets: Asset[] = [];

  // Fetch balances in parallel
  const results = await Promise.all(
    wallets.map(wallet => fetchWalletBalance(wallet.address, wallet.chain))
  );

  // Combine all assets
  results.forEach(result => {
    allAssets.push(...result.assets);
  });

  // Merge assets with the same symbol across different chains
  const mergedAssets = mergeAssets(allAssets);

  // Sort by value (highest first) and take top 10
  const topAssets = mergedAssets
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  console.log(`Returning top ${topAssets.length} holdings (from ${mergedAssets.length} total assets)`);

  return topAssets;
}

// Merge assets with same symbol from different chains
function mergeAssets(assets: Asset[]): Asset[] {
  const assetMap = new Map<string, Asset>();

  assets.forEach(asset => {
    const key = `${asset.symbol}-${asset.chain}`;
    if (assetMap.has(key)) {
      const existing = assetMap.get(key)!;
      existing.balance += asset.balance;
      existing.value += asset.value;
    } else {
      assetMap.set(key, { ...asset });
    }
  });

  return Array.from(assetMap.values());
}
