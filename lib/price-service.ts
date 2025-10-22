import axios from 'axios';
import { PriceData } from '@/types';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Map common symbols to CoinGecko IDs
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'MATIC': 'matic-network',
  'POLYGON': 'matic-network',
  'BNB': 'binancecoin',
  'AVAX': 'avalanche-2',
  'USDC': 'usd-coin',
  'USDT': 'tether',
  'DAI': 'dai',
  'WETH': 'weth',
  'WBTC': 'wrapped-bitcoin',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'AAVE': 'aave',
  'CRV': 'curve-dao-token',
  'MKR': 'maker',
  'SNX': 'havven',
  'COMP': 'compound-governance-token',
  'SUSHI': 'sushi',
};

// Fetch prices for multiple tokens
export async function fetchPrices(symbols: string[]): Promise<PriceData> {
  try {
    // Convert symbols to CoinGecko IDs
    const ids = symbols
      .map(symbol => SYMBOL_TO_COINGECKO_ID[symbol.toUpperCase()] || symbol.toLowerCase())
      .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates

    if (ids.length === 0) {
      return {};
    }

    const response = await axios.get(`${COINGECKO_API}/simple/price`, {
      params: {
        ids: ids.join(','),
        vs_currencies: 'usd',
        include_24hr_change: true,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching prices:', error);
    return {};
  }
}

// Fetch price for a single token
export async function fetchPrice(symbol: string): Promise<number> {
  const prices = await fetchPrices([symbol]);
  const coingeckoId = SYMBOL_TO_COINGECKO_ID[symbol.toUpperCase()] || symbol.toLowerCase();
  return prices[coingeckoId]?.usd || 0;
}

// Fetch token info by contract address
export async function fetchTokenInfo(contractAddress: string, chain: string): Promise<{
  symbol: string;
  name: string;
  decimals: number;
  price: number;
} | null> {
  try {
    // Map chain names to CoinGecko platform IDs
    const platformMap: Record<string, string> = {
      'ethereum': 'ethereum',
      'polygon': 'polygon-pos',
      'bsc': 'binance-smart-chain',
      'arbitrum': 'arbitrum-one',
      'optimism': 'optimistic-ethereum',
      'avalanche': 'avalanche',
      'base': 'base',
    };

    const platform = platformMap[chain];
    if (!platform) return null;

    const response = await axios.get(
      `${COINGECKO_API}/coins/${platform}/contract/${contractAddress}`
    );

    const data = response.data;
    return {
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      decimals: data.detail_platforms?.[platform]?.decimal_place || 18,
      price: data.market_data?.current_price?.usd || 0,
    };
  } catch (error) {
    console.error('Error fetching token info:', error);
    return null;
  }
}

// Get CoinGecko ID from symbol
export function getCoinGeckoId(symbol: string): string {
  return SYMBOL_TO_COINGECKO_ID[symbol.toUpperCase()] || symbol.toLowerCase();
}
