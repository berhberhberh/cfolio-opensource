import axios from 'axios';

// DexScreener API for getting prices of low-cap tokens
const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex';

// Fetch token price from DexScreener
export async function fetchTokenPriceFromDex(
  tokenAddress: string,
  chain: 'solana' | 'ethereum' | 'bsc' | 'polygon' | 'base' | 'arbitrum' | 'optimism' | 'avalanche'
): Promise<{ price: number; symbol: string; name: string } | null> {
  try {
    // Map chain names to DexScreener chain IDs
    const chainMap: Record<string, string> = {
      'solana': 'solana',
      'ethereum': 'ethereum',
      'bsc': 'bsc',
      'polygon': 'polygon',
      'base': 'base',
      'arbitrum': 'arbitrum',
      'optimism': 'optimism',
      'avalanche': 'avalanche',
    };

    const chainId = chainMap[chain];
    if (!chainId) return null;

    console.log(`Fetching price from DexScreener for ${tokenAddress} on ${chain}`);

    const response = await axios.get(
      `${DEXSCREENER_API}/tokens/${tokenAddress}`,
      { timeout: 5000 }
    );

    const pairs = response.data?.pairs;
    if (!pairs || pairs.length === 0) {
      console.log('No pairs found on DexScreener');
      return null;
    }

    // Get the pair with highest liquidity
    const bestPair = pairs
      .filter((p: any) => p.chainId === chainId)
      .sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];

    if (!bestPair) {
      console.log('No matching pairs for chain');
      return null;
    }

    const price = parseFloat(bestPair.priceUsd || '0');
    const symbol = bestPair.baseToken?.symbol || 'UNKNOWN';
    const name = bestPair.baseToken?.name || 'Unknown Token';

    console.log(`DexScreener price for ${symbol}: $${price}`);

    return { price, symbol, name };
  } catch (error) {
    console.error('Error fetching from DexScreener:', error);
    return null;
  }
}

// Fetch multiple token prices in batch
export async function fetchMultipleTokenPrices(
  tokens: Array<{ address: string; chain: string }>
): Promise<Map<string, { price: number; symbol: string; name: string }>> {
  const priceMap = new Map();

  for (const token of tokens) {
    const data = await fetchTokenPriceFromDex(
      token.address,
      token.chain as any
    );

    if (data) {
      priceMap.set(token.address, data);
    }

    // Rate limiting - wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return priceMap;
}
