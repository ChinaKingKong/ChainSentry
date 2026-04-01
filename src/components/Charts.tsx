/**
 * Charts 组件 - 图表展示
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import type { Token } from '../types/token';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartsProps {
  tokens: Token[];
}

export function Charts({ tokens }: ChartsProps) {
  if (tokens.length === 0) {
    return (
      <div className="rounded-lg bg-gray-800/50 p-8 text-center text-gray-400">
        等待数据...
      </div>
    );
  }

  // 流动性分布图
  const liquidityData = {
    labels: tokens.slice(0, 10).map(t => t.symbol),
    datasets: [
      {
        label: '流动性 (USD)',
        data: tokens.slice(0, 10).map(t => t.liquidity),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  // 风险评分分布图
  const riskCounts = tokens.reduce((acc, token) => {
    acc[token.risk_score] = (acc[token.risk_score] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const riskData = {
    labels: ['A', 'B', 'C', 'D'],
    datasets: [
      {
        data: [
          riskCounts['A'] || 0,
          riskCounts['B'] || 0,
          riskCounts['C'] || 0,
          riskCounts['D'] || 0,
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.6)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(239, 68, 68, 0.6)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: '#9CA3AF',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#9CA3AF',
          callback: (value: string | number) =>
            `$${(Number(value) / 1e6).toFixed(0)}M`,
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
      },
      x: {
        ticks: {
          color: '#9CA3AF',
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
      },
    },
  };

  return (
    <div className="space-y-6 rounded-lg bg-gray-800/50 p-6 backdrop-blur">
      <h2 className="text-xl font-bold text-white">📊 数据分析</h2>

      {/* 流动性分布 */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-300">
          💰 流动性分布 (Top 10)
        </h3>
        <div className="h-64">
          <Bar data={liquidityData} options={chartOptions} />
        </div>
      </div>

      {/* 风险评分分布 */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-300">
          ⚠️ 风险评分分布
        </h3>
        <div className="h-64">
          <Pie
            data={riskData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: {
                  position: 'bottom' as const,
                  labels: {
                    color: '#9CA3AF',
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
