import { Chain, ChainType } from '@/types';

export const CHAINS: Record<ChainType, Chain> = {
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    logo: '⟠',
  },
  bitcoin: {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    explorerUrl: 'https://blockchain.info',
    logo: '₿',
  },
  solana: {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://solscan.io',
    logo: '◎',
  },
  polygon: {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    logo: '⬡',
  },
  bsc: {
    id: 'bsc',
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    logo: '●',
  },
  arbitrum: {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ETH',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    logo: '🔷',
  },
  optimism: {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    logo: '🔴',
  },
  avalanche: {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorerUrl: 'https://snowtrace.io',
    logo: '🔺',
  },
  base: {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    logo: '🔵',
  },
};

// Get chain by ID
export function getChain(chainId: ChainType): Chain {
  return CHAINS[chainId];
}

// Get all supported chains
export function getAllChains(): Chain[] {
  return Object.values(CHAINS);
}

// Validate wallet address format
export function isValidAddress(address: string, chain: ChainType): boolean {
  switch (chain) {
    case 'ethereum':
    case 'polygon':
    case 'bsc':
    case 'arbitrum':
    case 'optimism':
    case 'avalanche':
    case 'base':
      // EVM address validation (0x followed by 40 hex characters)
      return /^0x[a-fA-F0-9]{40}$/.test(address);

    case 'bitcoin':
      // Bitcoin address validation (simplified - supports legacy, segwit, bech32)
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) ||
             /^bc1[a-z0-9]{39,59}$/.test(address);

    case 'solana':
      // Solana address validation (base58, 32-44 characters)
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);

    default:
      return false;
  }
}
