'use client';

import { useState } from 'react';
import { Wallet, ChainType } from '@/types';
import { getAllChains, isValidAddress } from '@/lib/chains';
import { Plus, X } from 'lucide-react';

interface WalletImportProps {
  onAddWallet: (wallet: Wallet) => void;
}

export default function WalletImport({ onAddWallet }: WalletImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [chain, setChain] = useState<ChainType>('ethereum');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');

  const chains = getAllChains();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate address
    if (!address.trim()) {
      setError('Please enter a wallet address');
      return;
    }

    if (!isValidAddress(address.trim(), chain)) {
      setError(`Invalid ${chain} address format`);
      return;
    }

    // Create wallet
    const wallet: Wallet = {
      id: `${chain}-${address}-${Date.now()}`,
      address: address.trim(),
      chain,
      label: label.trim() || undefined,
      addedAt: Date.now(),
    };

    try {
      onAddWallet(wallet);
      // Reset form
      setAddress('');
      setLabel('');
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add wallet');
    }
  };

  return (
    <div>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Wallet
        </button>
      ) : (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Import Wallet</h3>
            <button
              onClick={() => {
                setIsOpen(false);
                setError('');
                setAddress('');
                setLabel('');
              }}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Chain Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Blockchain
              </label>
              <select
                value={chain}
                onChange={(e) => setChain(e.target.value as ChainType)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {chains.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.logo} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Address Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={`Enter ${chain} address`}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Label Input (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Label (Optional)
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., My Main Wallet"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Import Wallet
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
