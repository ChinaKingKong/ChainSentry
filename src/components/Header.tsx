/**
 * Header 组件
 */

import { Shield, Radio } from 'lucide-react';
import { useSolanaChain } from '../hooks/useSolanaChain';
import { SOLANA_CLUSTER } from '../config/solana';

export function Header() {
  const { stats, loading, error } = useSolanaChain(15000);

  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center">
            <Shield className="mr-3 h-10 w-10 text-emerald-500" />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                ChainSentry
              </h1>
              <p className="text-gray-400">
                你的链上哨兵 · 7×24 小时守卫你的 Alpha
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-3 rounded-lg border border-gray-700/80 bg-gray-800/40 px-4 py-2 text-sm text-gray-300"
            title="Solana RPC"
          >
            <Radio
              className={`h-4 w-4 shrink-0 ${
                error ? 'text-red-400' : loading ? 'text-amber-400' : 'text-emerald-400'
              }`}
            />
            <div className="text-left">
              <div className="font-medium text-white">
                Solana · {SOLANA_CLUSTER}
              </div>
              {error ? (
                <div className="text-xs text-red-400">{error}</div>
              ) : stats ? (
                <div className="text-xs text-gray-400">
                  Finalized 槽位 {stats.slot.toLocaleString()} · Epoch{' '}
                  {stats.epoch}
                </div>
              ) : (
                <div className="text-xs text-gray-500">连接 RPC…</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
