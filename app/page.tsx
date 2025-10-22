'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Wallet as WalletType, Asset, PortfolioSnapshot } from '@/types';
import WalletImport from '@/components/WalletImport';
import WalletList from '@/components/WalletList';
import PortfolioDashboard from '@/components/PortfolioDashboard';
import PortfolioChart from '@/components/PortfolioChart';
import { fetchAllBalancesClient } from '@/lib/balance-client';
import { RefreshCw, Wallet, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalValue, setTotalValue] = useState(0);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Load wallets and snapshots on mount
  useEffect(() => {
    if (status === 'authenticated') {
      loadWallets();
      loadSnapshots();
    }
  }, [status]);

  const loadWallets = async () => {
    try {
      const res = await fetch('/api/wallets');
      const data = await res.json();

      if (res.ok && data.wallets) {
        setWallets(data.wallets);
        if (data.wallets.length > 0) {
          refreshBalances(data.wallets);
        }
      }
    } catch (error) {
      console.error('Error loading wallets:', error);
    }
  };

  const loadSnapshots = async () => {
    try {
      const res = await fetch('/api/snapshots');
      const data = await res.json();

      if (res.ok && data.snapshots) {
        const formattedSnapshots = data.snapshots.map((s: any) => ({
          timestamp: new Date(s.timestamp).getTime(),
          totalValue: s.totalValue,
          assetValues: s.assetValues,
        }));
        setSnapshots(formattedSnapshots);
      }
    } catch (error) {
      console.error('Error loading snapshots:', error);
    }
  };

  // Refresh balances
  const refreshBalances = async (walletsToFetch: WalletType[] = wallets) => {
    if (walletsToFetch.length === 0) return;

    setIsLoading(true);
    try {
      const fetchedAssets = await fetchAllBalancesClient(
        walletsToFetch.map((w) => ({ address: w.address, chain: w.chain as any }))
      );

      setAssets(fetchedAssets);

      // Calculate total value
      const total = fetchedAssets.reduce((sum, asset) => sum + asset.value, 0);
      setTotalValue(total);

      // Save snapshot
      if (total > 0) {
        const res = await fetch('/api/snapshots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            totalValue: total,
            assetValues: fetchedAssets.map((a) => ({
              symbol: a.symbol,
              value: a.value,
            })),
          }),
        });

        if (res.ok) {
          await loadSnapshots();
        }
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a wallet
  const handleAddWallet = async (wallet: Omit<WalletType, 'id' | 'addedAt'>) => {
    try {
      const res = await fetch('/api/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wallet),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add wallet');
      }

      await loadWallets();
    } catch (error: any) {
      throw error;
    }
  };

  // Handle removing a wallet
  const handleRemoveWallet = async (walletId: string) => {
    try {
      const res = await fetch(`/api/wallets?id=${walletId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await loadWallets();
      }
    } catch (error) {
      console.error('Error removing wallet:', error);
    }
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (status !== 'authenticated') {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                <Wallet size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold">Cryptfolio</h1>
                <p className="text-xs text-gray-400">{session.user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refreshBalances()}
                disabled={isLoading || wallets.length === 0}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Portfolio Overview - Full Width */}
        <div className="mb-8">
          <PortfolioDashboard
            assets={assets}
            totalValue={totalValue}
            isLoading={isLoading}
            snapshots={snapshots}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Portfolio Chart */}
          <div>
            {snapshots.length > 0 && <PortfolioChart snapshots={snapshots} />}
          </div>

          {/* Right: Wallets */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Wallets</h2>
            <WalletImport onAddWallet={handleAddWallet} />
            <WalletList
              wallets={wallets}
              onRemoveWallet={handleRemoveWallet}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
