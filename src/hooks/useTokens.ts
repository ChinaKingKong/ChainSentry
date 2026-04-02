/**
 * 自定义 Hooks
 */

import { useState, useEffect, useCallback } from 'react';
import i18n from '../i18n';
import { TokenService } from '../services/api';
import type { Token, TokenFeedCategory } from '../types/token';

export function useTokens(
  limit: number = 20,
  autoRefresh: boolean = false,
  refreshInterval: number = 30000,
  category: TokenFeedCategory = 'meme',
  /** 错开多路 feed 的首包与轮询，减轻 Dex 瞬时 QPS */
  startDelayMs: number = 0
) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchTokens = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await TokenService.getTopTokens(limit, category);
      setTokens(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : i18n.t('errors.fetchTokens')
      );
    } finally {
      setLoading(false);
    }
  }, [limit, category]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const startTimer = window.setTimeout(() => {
      void fetchTokens();
      if (autoRefresh) {
        interval = window.setInterval(() => void fetchTokens(), refreshInterval);
      }
    }, startDelayMs);
    return () => {
      window.clearTimeout(startTimer);
      if (interval != null) window.clearInterval(interval);
    };
  }, [fetchTokens, autoRefresh, refreshInterval, startDelayMs]);

  return {
    tokens,
    loading,
    error,
    lastUpdate,
    refetch: fetchTokens,
  };
}
