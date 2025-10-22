import { Portfolio, Wallet, PortfolioSnapshot } from '@/types';

const STORAGE_KEYS = {
  WALLETS: 'cryptfolio_wallets',
  SNAPSHOTS: 'cryptfolio_snapshots',
};

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Wallet Management
export function saveWallets(wallets: Wallet[]): void {
  if (!isBrowser) return;
  localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
}

export function getWallets(): Wallet[] {
  if (!isBrowser) return [];
  const data = localStorage.getItem(STORAGE_KEYS.WALLETS);
  return data ? JSON.parse(data) : [];
}

export function addWallet(wallet: Wallet): Wallet[] {
  const wallets = getWallets();

  // Check if wallet already exists
  const exists = wallets.some(
    w => w.address.toLowerCase() === wallet.address.toLowerCase() && w.chain === wallet.chain
  );

  if (exists) {
    throw new Error('Wallet already exists');
  }

  wallets.push(wallet);
  saveWallets(wallets);
  return wallets;
}

export function removeWallet(walletId: string): Wallet[] {
  const wallets = getWallets().filter(w => w.id !== walletId);
  saveWallets(wallets);
  return wallets;
}

export function updateWalletLabel(walletId: string, label: string): Wallet[] {
  const wallets = getWallets().map(w =>
    w.id === walletId ? { ...w, label } : w
  );
  saveWallets(wallets);
  return wallets;
}

// Portfolio Snapshot Management
export function saveSnapshot(snapshot: PortfolioSnapshot): void {
  if (!isBrowser) return;
  const snapshots = getSnapshots();
  snapshots.push(snapshot);

  // Keep only last 7 days of snapshots
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const filtered = snapshots.filter(s => s.timestamp > sevenDaysAgo);

  localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(filtered));
}

export function getSnapshots(): PortfolioSnapshot[] {
  if (!isBrowser) return [];
  const data = localStorage.getItem(STORAGE_KEYS.SNAPSHOTS);
  return data ? JSON.parse(data) : [];
}

export function clearSnapshots(): void {
  if (!isBrowser) return;
  localStorage.removeItem(STORAGE_KEYS.SNAPSHOTS);
}

// Get the last snapshot timestamp
export function getLastSnapshotTime(): number | null {
  const snapshots = getSnapshots();
  if (snapshots.length === 0) return null;
  return Math.max(...snapshots.map(s => s.timestamp));
}

// Check if we should take a new snapshot
// Takes snapshots on:
// 1. First snapshot ever
// 2. Significant value change (>0.5% from last snapshot)
// 3. At least 30 minutes has passed since last snapshot
export function shouldTakeSnapshot(currentValue: number): boolean {
  const snapshots = getSnapshots();

  // Always take first snapshot
  if (snapshots.length === 0) return true;

  const lastSnapshot = snapshots[snapshots.length - 1];
  const timeSinceLastSnapshot = Date.now() - lastSnapshot.timestamp;

  // Take snapshot if at least 30 minutes has passed
  const thirtyMinutes = 30 * 60 * 1000;
  if (timeSinceLastSnapshot >= thirtyMinutes) return true;

  // Take snapshot if value changed by more than 0.5%
  const valueChange = Math.abs(currentValue - lastSnapshot.totalValue);
  const percentChange = lastSnapshot.totalValue > 0
    ? (valueChange / lastSnapshot.totalValue) * 100
    : 0;

  if (percentChange >= 0.5) return true;

  return false;
}

// Clear all data
export function clearAllData(): void {
  if (!isBrowser) return;
  localStorage.removeItem(STORAGE_KEYS.WALLETS);
  localStorage.removeItem(STORAGE_KEYS.SNAPSHOTS);
}

// Export portfolio data
export function exportPortfolio(): string {
  const portfolio = {
    wallets: getWallets(),
    snapshots: getSnapshots(),
    exportedAt: Date.now(),
  };
  return JSON.stringify(portfolio, null, 2);
}

// Import portfolio data
export function importPortfolio(jsonData: string): void {
  try {
    const portfolio = JSON.parse(jsonData);
    if (portfolio.wallets) saveWallets(portfolio.wallets);
    if (portfolio.snapshots) {
      localStorage.setItem(STORAGE_KEYS.SNAPSHOTS, JSON.stringify(portfolio.snapshots));
    }
  } catch (error) {
    throw new Error('Invalid portfolio data');
  }
}
