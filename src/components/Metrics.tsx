/**
 * Metrics 组件 - 关键指标
 */

import { TrendingUp, DollarSign, Activity, ShieldAlert } from 'lucide-react';
import type { Token } from '../types/token';

interface MetricsProps {
  tokens: Token[];
}

export function Metrics({ tokens }: MetricsProps) {
  if (tokens.length === 0) {
    return null;
  }

  const totalLiquidity = tokens.reduce((sum, t) => sum + t.liquidity, 0);
  const totalVolume = tokens.reduce((sum, t) => sum + t.volume_24h, 0);
  const avgRisk = tokens[0]?.risk_score || 'N/A';

  const metrics = [
    {
      label: '监控代币',
      value: tokens.length,
      icon: Activity,
      color: 'text-blue-500',
    },
    {
      label: '总流动性',
      value: `$${(totalLiquidity / 1e9).toFixed(2)}B`,
      icon: DollarSign,
      color: 'text-emerald-500',
    },
    {
      label: '24h 交易量',
      value: `$${(totalVolume / 1e6).toFixed(2)}M`,
      icon: TrendingUp,
      color: 'text-purple-500',
    },
    {
      label: '主要风险等级',
      value: avgRisk,
      icon: ShieldAlert,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-lg bg-gray-800/50 p-6 backdrop-blur"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">{metric.label}</p>
              <p className="mt-2 text-2xl font-bold text-white">{metric.value}</p>
            </div>
            <metric.icon className={`h-8 w-8 ${metric.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
