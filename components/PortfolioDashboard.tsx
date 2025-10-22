'use client';

import { Asset, PortfolioSnapshot } from '@/types';
import { getChain } from '@/lib/chains';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface PortfolioDashboardProps {
  assets: Asset[];
  totalValue: number;
  isLoading: boolean;
  snapshots: PortfolioSnapshot[];
}

export default function PortfolioDashboard({
  assets,
  totalValue,
  isLoading,
  snapshots,
}: PortfolioDashboardProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mx-auto mb-4"></div>
          <div className="h-12 bg-gray-700 rounded w-64 mx-auto"></div>
        </div>
        <p className="text-gray-400 mt-4">Loading portfolio...</p>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
        <p className="text-gray-400">Import wallets to see your portfolio value</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value < 0.01) {
      return value.toExponential(4);
    }
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
  };

  // Sort assets by value (highest first)
  const sortedAssets = [...assets].sort((a, b) => b.value - a.value);

  // Prepare mini chart data (last 7 days)
  const chartData = snapshots.slice(-7).map((snapshot) => ({
    value: snapshot.totalValue,
  }));

  // Calculate change from snapshots
  const hasSnapshots = snapshots.length > 0;
  const firstValue = hasSnapshots ? snapshots[0]?.totalValue || 0 : totalValue;
  const change = totalValue - firstValue;
  const changePercent = firstValue > 0 ? (change / firstValue) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <div className="space-y-6">
      {/* Total Value Card */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium opacity-90 mb-2">Total Portfolio Value</p>
            <p className="text-4xl font-bold mb-3">{formatCurrency(totalValue)}</p>
            <div className="flex items-center gap-3 text-sm">
              <span className="opacity-90">{assets.length} asset{assets.length !== 1 ? 's' : ''}</span>
              <span className="opacity-60">•</span>
              <span className="opacity-90">{new Set(assets.map(a => a.chain)).size} chain{new Set(assets.map(a => a.chain)).size !== 1 ? 's' : ''}</span>
              {hasSnapshots && (
                <>
                  <span className="opacity-60">•</span>
                  <div className="flex items-center gap-1">
                    {isPositive ? (
                      <TrendingUp size={14} className="opacity-90" />
                    ) : (
                      <TrendingDown size={14} className="opacity-90" />
                    )}
                    <span className="font-medium">
                      {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mini Chart */}
          {chartData.length > 1 && (
            <div className="w-32 h-16 -mr-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <YAxis hide domain={['dataMin', 'dataMax']} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Assets List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold">Assets</h3>
        </div>

        <div className="divide-y divide-gray-700">
          {sortedAssets.map((asset, index) => {
            const chain = getChain(asset.chain);
            const percentage = (asset.value / totalValue) * 100;

            return (
              <div key={`${asset.symbol}-${asset.chain}-${index}`} className="px-6 py-4 hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-2xl">{chain.logo}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{asset.symbol}</span>
                        <span className="text-xs text-gray-500 uppercase">{chain.name}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {formatNumber(asset.balance)} {asset.symbol}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-white">
                      {formatCurrency(asset.value)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {percentage.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
