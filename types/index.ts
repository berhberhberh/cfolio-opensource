// Supported blockchain networks
export type ChainType = 'ethereum' | 'bitcoin' | 'solana' | 'polygon' | 'bsc' | 'arbitrum' | 'optimism' | 'avalanche' | 'base';

// Blockchain network configuration
export interface Chain {
  id: ChainType;
  name: string;
  symbol: string;
  rpcUrl?: string;
  explorerUrl: string;
  logo: string;
}

// Crypto asset/token
export interface Asset {
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  price: number;
  value: number; // balance * price
  chain: ChainType;
  contractAddress?: string; // For tokens
  logo?: string;
  coingeckoId?: string;
}

// Wallet across different chains
export interface Wallet {
  id: string;
  address: string;
  chain: ChainType;
  label?: string;
  addedAt: number; // timestamp
}

// Portfolio snapshot for historical tracking
export interface PortfolioSnapshot {
  timestamp: number;
  totalValue: number;
  assetValues: {
    symbol: string;
    value: number;
  }[];
}

// Complete portfolio data
export interface Portfolio {
  wallets: Wallet[];
  assets: Asset[];
  totalValue: number;
  snapshots: PortfolioSnapshot[];
}

// API response types
export interface PriceData {
  [symbol: string]: {
    usd: number;
    usd_24h_change?: number;
  };
}

export interface BalanceResponse {
  chain: ChainType;
  address: string;
  assets: Asset[];
}
