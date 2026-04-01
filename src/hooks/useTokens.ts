/**
 * 自定义 Hooks
 */

import { useState, useEffect, useCallback } from 'react';
import { TokenService } from '../services/api';
import type { Token } from '../types/token';

export function useTokens(limit: number = 20, autoRefresh: boolean = false, refreshInterval: number = 30000) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchTokens = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await TokenService.getTopTokens(limit);
      setTokens(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tokens');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void fetchTokens();

    if (autoRefresh) {
      const interval = setInterval(() => void fetchTokens(), refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchTokens, autoRefresh, refreshInterval]);

  return {
    tokens,
    loading,
    error,
    lastUpdate,
    refetch: fetchTokens,
  };
}
