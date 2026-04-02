import { useCallback, useMemo, useRef, useState } from 'react';
import {
  computeSecurityScore,
  fetchMintAuditOnChain,
  type MintAuditOnChain,
} from '../services/mintAudit';
import { TokenService } from '../services/api';
import type { DexScreenerPair } from '../types/token';
import { pushSentryRecentAnalysis } from '../lib/sentryRecentCache';
import { tryParseSolanaAddress } from '../lib/solanaAddress';

export type SentryTableStatus = 'passed' | 'warning' | 'failed';

export type SentryCheckRow = {
  id: string;
  labelKey: string;
  status: SentryTableStatus;
  evidence: string;
  evidenceI18nKey?: string;
  evidenceParams?: Record<string, string | number>;
  timeLabel: string;
};

export function useSentryAudit() {
  const scanGen = useRef(0);
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [audit, setAudit] = useState<MintAuditOnChain | null>(null);
  const [pair, setPair] = useState<DexScreenerPair | null>(null);

  const clear = useCallback(() => {
    scanGen.current += 1;
    setLoading(false);
    setAudit(null);
    setPair(null);
    setErrorKey(null);
  }, []);

  const analyze = useCallback(async (rawInput: string) => {
    const mint = tryParseSolanaAddress(rawInput);
    if (!mint) {
      setErrorKey('sentryErrors.invalidMint');
      setAudit(null);
      setPair(null);
      return;
    }
    const gen = ++scanGen.current;
    setLoading(true);
    setErrorKey(null);
    try {
      const onChain = await fetchMintAuditOnChain(mint);
      if (gen !== scanGen.current) return;
      if (!onChain) {
        setErrorKey('sentryErrors.notSplMint');
        setAudit(null);
        setPair(null);
        return;
      }
      setAudit(onChain);
      const best = await TokenService.getBestPairForMint(mint);
      if (gen !== scanGen.current) return;
      setPair(best);
      const liqUsd = best?.liquidity?.usd ?? null;
      const sc = computeSecurityScore(onChain, liqUsd);
      const sym =
        best?.baseToken?.symbol?.trim() ||
        `${mint.slice(0, 4)}…${mint.slice(-4)}`;
      pushSentryRecentAnalysis({ mint: onChain.mint, symbol: sym, score: sc });
    } catch {
      if (gen !== scanGen.current) return;
      setErrorKey('sentryErrors.auditFailed');
      setAudit(null);
      setPair(null);
    } finally {
      if (gen === scanGen.current) setLoading(false);
    }
  }, []);

  const liquidityUsd = pair?.liquidity?.usd ?? null;

  const score = useMemo(
    () => (audit ? computeSecurityScore(audit, liquidityUsd) : null),
    [audit, liquidityUsd]
  );

  const symbol = pair?.baseToken?.symbol ?? null;
  const displayName = pair?.baseToken?.name ?? symbol;

  const tableRows: SentryCheckRow[] = useMemo(() => {
    if (!audit) return [];
    const timeLabel = new Date(audit.fetchedAt * 1000).toLocaleString();
    const shortMint = `${audit.mint.slice(0, 4)}…${audit.mint.slice(-4)}`;

    return [
      {
        id: 'mint',
        labelKey: 'checkMint',
        status: audit.mintAuthorityDisabled ? 'passed' : 'failed',
        evidence: `RPC · ${shortMint}`,
        timeLabel,
      },
      {
        id: 'freeze',
        labelKey: 'checkFreeze',
        status: audit.freezeAuthorityRemoved ? 'passed' : 'failed',
        evidence: `RPC · ${shortMint}`,
        timeLabel,
      },
      {
        id: 'holders',
        labelKey: 'checkHolders',
        status:
          audit.top10HolderPct <= 40
            ? 'passed'
            : audit.top10HolderPct <= 65
              ? 'warning'
              : 'failed',
        evidence: `${audit.top10HolderPct.toFixed(1)}% · top10/supply`,
        timeLabel,
      },
      {
        id: 'meta',
        labelKey: 'checkMeta',
        status: 'warning',
        evidence: '',
        evidenceI18nKey: 'metaEvidence',
        timeLabel,
      },
      {
        id: 'tax',
        labelKey: 'checkTax',
        status:
          audit.transferFeeBasisPoints === 0
            ? 'passed'
            : audit.transferFeeBasisPoints <= 500
              ? 'warning'
              : 'failed',
        evidence: '',
        evidenceI18nKey:
          audit.transferFeeBasisPoints === 0
            ? 'taxEvidenceZero'
            : 'taxEvidenceActive',
        evidenceParams:
          audit.transferFeeBasisPoints === 0
            ? {
                program:
                  audit.tokenProgram === 'spl-token' ? 'SPL' : 'Token-2022',
              }
            : {
                pct: (audit.transferFeeBasisPoints / 100).toFixed(2),
                bps: audit.transferFeeBasisPoints,
              },
        timeLabel,
      },
    ];
  }, [audit]);

  return {
    loading,
    errorKey,
    audit,
    pair,
    score,
    symbol,
    displayName,
    liquidityUsd,
    tableRows,
    analyze,
    clear,
  };
}
