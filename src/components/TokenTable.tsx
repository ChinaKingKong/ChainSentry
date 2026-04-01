/**
 * TokenTable 组件 - 代币表格
 */

import type { Token } from '../types/token';

interface TokenTableProps {
  tokens: Token[];
  loading: boolean;
  onSelectToken: (token: Token) => void;
}

export function TokenTable({ tokens, loading, onSelectToken }: TokenTableProps) {
  if (loading) {
    return (
      <div className="rounded-lg bg-gray-800/50 p-8 text-center text-gray-400">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <span className="ml-3">正在获取链上数据...</span>
        </div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="rounded-lg bg-gray-800/50 p-8 text-center text-gray-400">
        ⚠️ 暂无数据，请稍后刷新
      </div>
    );
  }

  const getRiskColor = (score: string) => {
    const colors = {
      A: 'bg-emerald-500/20 text-emerald-400',
      B: 'bg-blue-500/20 text-blue-400',
      C: 'bg-yellow-500/20 text-yellow-400',
      D: 'bg-red-500/20 text-red-400',
    };
    return colors[score as keyof typeof colors] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="rounded-lg bg-gray-800/50 backdrop-blur">
      <div className="mb-4 flex items-center justify-between p-4">
        <h2 className="text-xl font-bold text-white">🔥 热门代币列表</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-700 bg-gray-900/50">
            <tr className="text-left text-sm text-gray-400">
              <th className="px-4 py-3">代币</th>
              <th className="px-4 py-3">价格</th>
              <th className="px-4 py-3">流动性</th>
              <th className="px-4 py-3">24h 交易量</th>
              <th className="px-4 py-3">24h 涨跌</th>
              <th className="px-4 py-3">风险</th>
              <th className="px-4 py-3">DEX</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => (
              <tr
                key={token.address}
                className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors cursor-pointer"
                onClick={() => onSelectToken(token)}
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="font-semibold text-white">{token.symbol}</p>
                    <p className="text-sm text-gray-400">{token.name}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-white">
                  ${token.price > 0 ? token.price.toFixed(6) : 'N/A'}
                </td>
                <td className="px-4 py-3 text-white">
                  ${token.liquidity.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-white">
                  ${token.volume_24h.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      token.change_24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }
                  >
                    {token.change_24h >= 0 ? '+' : ''}
                    {token.change_24h.toFixed(2)}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-1 text-sm font-semibold ${getRiskColor(
                      token.risk_score
                    )}`}
                  >
                    {token.risk_score}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300">{token.dex}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectToken(token);
                    }}
                    className="rounded bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-700"
                  >
                    查看
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
