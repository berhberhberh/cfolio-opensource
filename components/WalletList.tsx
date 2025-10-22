'use client';

import { Wallet } from '@/types';
import { getChain } from '@/lib/chains';
import { Trash2, ExternalLink } from 'lucide-react';

interface WalletListProps {
  wallets: Wallet[];
  onRemoveWallet: (walletId: string) => void;
}

export default function WalletList({ wallets, onRemoveWallet }: WalletListProps) {
  if (wallets.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
        <p className="text-gray-400">No wallets added yet. Import your first wallet to get started!</p>
      </div>
    );
  }

  const formatAddress = (address: string) => {
    if (address.length <= 13) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-3">
      {wallets.map((wallet) => {
        const chain = getChain(wallet.chain);
        const explorerUrl = `${chain.explorerUrl}/address/${wallet.address}`;

        return (
          <div
            key={wallet.id}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="text-2xl">{chain.logo}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">
                      {wallet.label || chain.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {chain.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm text-gray-400">
                      {formatAddress(wallet.address)}
                    </code>
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                      title="View on explorer"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onRemoveWallet(wallet.id)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Remove wallet"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
