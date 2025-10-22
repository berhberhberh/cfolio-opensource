import { Asset, ChainType } from '@/types';

// Client-side balance fetching (calls API route)
export async function fetchWalletBalanceClient(
  address: string,
  chain: ChainType
): Promise<Asset[]> {
  try {
    console.log(`[Client] Fetching balance for ${chain} wallet:`, address);

    const response = await fetch('/api/balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address, chain }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Client] API error:', error);
      return [];
    }

    const result = await response.json();
    console.log(`[Client] Received ${result.assets?.length || 0} assets:`, result.assets);

    return result.assets || [];
  } catch (error) {
    console.error('[Client] Error fetching balance:', error);
    return [];
  }
}

// Fetch balances for multiple wallets
export async function fetchAllBalancesClient(
  wallets: { address: string; chain: ChainType }[]
): Promise<Asset[]> {
  console.log('[Client] Fetching balances for', wallets.length, 'wallets');

  const allAssets: Asset[] = [];

  // Fetch balances sequentially to avoid rate limiting
  for (const wallet of wallets) {
    const assets = await fetchWalletBalanceClient(wallet.address, wallet.chain);
    allAssets.push(...assets);
  }

  console.log('[Client] Total assets fetched:', allAssets.length);
  return allAssets;
}
