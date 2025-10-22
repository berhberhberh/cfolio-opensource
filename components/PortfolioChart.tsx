'use client';

import { PortfolioSnapshot } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PortfolioChartProps {
  snapshots: PortfolioSnapshot[];
}

export default function PortfolioChart({ snapshots }: PortfolioChartProps) {
  if (snapshots.length < 2) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
        <p className="text-gray-400">
          {snapshots.length === 0
            ? 'Portfolio history will appear here after 24 hours'
            : 'Portfolio trend will show after collecting more snapshots (updates every 24 hours)'}
        </p>
      </div>
    );
  }

  // Format data for the chart
  const chartData = snapshots.map((snapshot) => ({
    date: new Date(snapshot.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    value: snapshot.totalValue,
    timestamp: snapshot.timestamp,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate change
  const firstValue = snapshots[0]?.totalValue || 0;
  const lastValue = snapshots[snapshots.length - 1]?.totalValue || 0;
  const change = lastValue - firstValue;
  const changePercent = firstValue > 0 ? (change / firstValue) * 100 : 0;
  const isPositive = change >= 0;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Portfolio History</h3>
          <div className="text-right">
            <div
              className={`text-sm font-medium ${
                isPositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {isPositive ? '+' : ''}
              {formatCurrency(change)} ({isPositive ? '+' : ''}
              {changePercent.toFixed(2)}%)
            </div>
            <div className="text-xs text-gray-500">
              7 Day Performance
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: number) => [formatCurrency(value), 'Value']}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
