import { useCallback, useEffect, useState } from 'react';
import {
  fetchRecentPairSignatures,
  type PairActivityRow,
} from '../services/pairActivity';

export function usePairActivity(pairAddress: string | undefined, limit = 12) {
  const [rows, setRows] = useState<PairActivityRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!pairAddress) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchRecentPairSignatures(pairAddress, limit);
      setRows(data);
    } finally {
      setLoading(false);
    }
  }, [pairAddress, limit]);

  useEffect(() => {
    void load();
  }, [load]);

  return { rows, loading, refetch: load };
}
