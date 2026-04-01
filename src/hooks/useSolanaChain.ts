import { useState, useEffect, useCallback, useRef } from 'react';
import i18n from '../i18n';
import {
  fetchSolanaChainStats,
  type SolanaChainStats,
} from '../services/solanaRpc';

export function useSolanaChain(pollIntervalMs: number = 15000) {
  const [stats, setStats] = useState<SolanaChainStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slotsPerSecond, setSlotsPerSecond] = useState<number | null>(null);
  const prevSample = useRef<{ slot: number; time: number } | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const next = await fetchSolanaChainStats();
      setStats(next);
      const now = Date.now();
      const p = prevSample.current;
      if (p) {
        const dt = (now - p.time) / 1000;
        if (dt > 0.4) {
          const ds = next.slot - p.slot;
          if (ds >= 0) setSlotsPerSecond(ds / dt);
        }
      }
      prevSample.current = { slot: next.slot, time: now };
    } catch (e) {
      setError(
        e instanceof Error ? e.message : i18n.t('errors.rpcFailed')
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    if (pollIntervalMs <= 0) return;
    const id = setInterval(() => void refresh(), pollIntervalMs);
    return () => clearInterval(id);
  }, [refresh, pollIntervalMs]);

  /** 用于仪表盘「吞吐」展示：约等于槽位/秒 × 1000，量级接近常见 TPS 展示习惯 */
  const activityIndex =
    slotsPerSecond != null ? Math.round(slotsPerSecond * 1000) : null;

  return { stats, loading, error, refresh, slotsPerSecond, activityIndex };
}
