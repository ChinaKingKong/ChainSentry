import { useEffect, useId, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Repeat, Search } from 'lucide-react';
import type { Token, DexScreenerPair } from '../../types/token';
import type { SentryCheckRow } from '../../hooks/useSentryAudit';
import type { MintAuditOnChain } from '../../services/mintAudit';
import { useClipboardCopy } from '../../hooks/useClipboardCopy';
import { MaterialIcon } from '../ui/MaterialIcon';
import { TokenService } from '../../services/api';
import { formatUsdCompact } from '../../lib/format';

const CIRC = 2 * Math.PI * 45;

function rowStatusUi(
  row: SentryCheckRow,
  t: (k: string) => string
): { dot: string; label: string; text: string } {
  if (row.status === 'passed') {
    return {
      dot: 'bg-secondary',
      label: t('sentryPage.statusPassed'),
      text: 'text-secondary',
    };
  }
  if (row.status === 'warning') {
    return {
      dot: 'bg-tertiary-container',
      label: t('sentryPage.statusWarning'),
      text: 'text-tertiary-container',
    };
  }
  return {
    dot: 'bg-error',
    label: t('sentryPage.statusFailed'),
    text: 'text-error',
  };
}

export type SentryScanModalProps = {
  open: boolean;
  onClose: () => void;
  token: Token | null;
  loading: boolean;
  errorKey: string | null;
  score: number | null;
  audit: MintAuditOnChain | null;
  pair: DexScreenerPair | null;
  symbol: string | null;
  displayName: string | null;
  liquidityUsd: number | null;
  tableRows: SentryCheckRow[];
};

export function SentryScanModal({
  open,
  onClose,
  token,
  loading,
  errorKey,
  score,
  audit,
  pair,
  symbol,
  displayName,
  liquidityUsd,
  tableRows,
}: SentryScanModalProps) {
  const { t } = useTranslation();
  const copyToClipboard = useClipboardCopy();
  const gradId = useId().replace(/:/g, '');
  const mintToCopy = audit?.mint ?? token?.address ?? '';

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const gaugeScore =
    audit != null && score != null ? score : 0;

  const dashOffset = useMemo(() => {
    const active = (gaugeScore / 100) * CIRC;
    return `${active} ${CIRC}`;
  }, [gaugeScore]);

  const meterSub = useMemo(() => {
    if (audit == null || score == null) return t('hero.dash');
    if (score >= 72) return t('sentryPage.secureLabel');
    if (score >= 48) return t('sentryPage.meterModerate');
    return t('sentryPage.meterPoor');
  }, [score, t]);

  if (!open) return null;

  const errMsg =
    errorKey &&
    (errorKey.startsWith('sentryErrors.') ? t(errorKey) : errorKey);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col md:items-center md:justify-center md:p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label={t('dashboard.sentryModalClose')}
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sentry-scan-modal-title"
        className="relative z-10 flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-surface-container-low shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85)] max-md:max-h-[100dvh] max-md:rounded-none md:max-h-[min(90vh,720px)] md:max-w-2xl md:flex-none md:rounded-lg md:border md:border-outline-variant/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-outline-variant/15 bg-surface-container-low px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0 pr-2">
            <h2
              id="sentry-scan-modal-title"
              className="font-headline text-base font-bold text-on-surface sm:text-lg"
            >
              {t('dashboard.sentryModalTitle')}
            </h2>
            {token ? (
              <p className="mt-1 line-clamp-2 text-xs text-on-surface-variant sm:text-sm">
                <span className="font-semibold text-primary">{token.symbol}</span>
                <span className="text-on-surface/50"> · </span>
                {token.name}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="touch-manipulation flex h-11 w-11 shrink-0 items-center justify-center rounded border border-outline-variant/30 text-on-surface-variant transition-colors hover:border-primary/40 hover:text-primary sm:h-9 sm:w-9"
            aria-label={t('dashboard.sentryModalClose')}
          >
            <MaterialIcon name="close" className="text-[22px] sm:text-xl" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-6 px-4 py-12 sm:px-6 sm:py-16">
              <div className="relative flex h-28 w-28 items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full border-2 border-primary/15 border-t-primary animate-spin"
                  style={{ animationDuration: '1.2s' }}
                />
                <div
                  className="absolute inset-3 rounded-full border-2 border-secondary/20 border-b-secondary animate-spin"
                  style={{
                    animationDuration: '0.85s',
                    animationDirection: 'reverse',
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <MaterialIcon
                    name="shield"
                    className="text-4xl text-primary animate-pulse"
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="font-headline text-sm font-semibold text-on-surface">
                  {t('dashboard.sentryScanLoading')}
                </p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  {t('dashboard.sentryScanLoadingHint')}
                </p>
              </div>
            </div>
          ) : errMsg ? (
            <div className="px-4 py-6 sm:px-5 sm:py-8">
              <div className="rounded border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
                {errMsg}
              </div>
            </div>
          ) : (
            <div className="space-y-5 px-4 py-4 sm:space-y-6 sm:px-5 sm:py-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center">
                <div className="relative flex h-[9.5rem] w-[9.5rem] shrink-0 items-center justify-center sm:h-44 sm:w-44">
                  <svg
                    className="h-full w-full -rotate-90"
                    viewBox="0 0 100 100"
                    aria-hidden
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="var(--color-surface-container-highest)"
                      strokeWidth="8"
                      strokeDasharray={CIRC}
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={`url(#${gradId})`}
                      strokeWidth="8"
                      strokeDasharray={dashOffset}
                      strokeLinecap="butt"
                    />
                    <defs>
                      <linearGradient
                        id={gradId}
                        x1="0%"
                        x2="100%"
                        y1="0%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#ffb4ab" />
                        <stop offset="50%" stopColor="#ffb147" />
                        <stop offset="100%" stopColor="#4edea3" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="font-headline text-2xl font-bold text-secondary sm:text-3xl">
                      {audit != null && score != null
                        ? `${score}%`
                        : t('hero.dash')}
                    </span>
                    <span className="font-label text-[10px] uppercase tracking-widest text-secondary">
                      {meterSub}
                    </span>
                  </div>
                </div>
                <div className="w-full max-w-sm flex-1 text-center sm:text-left">
                  <p className="font-label text-[10px] uppercase tracking-widest text-outline">
                    {t('sentryPage.tokenPrefix')}{' '}
                    <span className="text-primary">
                      {audit != null
                        ? symbol || token?.symbol || t('hero.dash')
                        : token?.symbol || t('hero.dash')}
                    </span>
                  </p>
                  {displayName ? (
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {displayName}
                    </p>
                  ) : null}
                  <div className="mt-2 flex items-start gap-2">
                    <p className="min-w-0 flex-1 break-all font-mono text-[10px] text-on-surface/45">
                      {mintToCopy || t('hero.dash')}
                    </p>
                    {mintToCopy ? (
                      <button
                        type="button"
                        onClick={() => void copyToClipboard(mintToCopy)}
                        className="touch-manipulation shrink-0 rounded p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary active:bg-surface-container-highest"
                        aria-label={t('tokensPage.copyMint')}
                      >
                        <MaterialIcon name="content_copy" className="text-lg sm:text-base" />
                      </button>
                    ) : null}
                  </div>
                  {liquidityUsd != null && pair ? (
                    <p className="mt-2 text-xs text-on-surface-variant">
                      {formatUsdCompact(liquidityUsd)} · {pair.dexId}
                    </p>
                  ) : null}
                </div>
              </div>

              {tableRows.length > 0 ? (
                <div className="-mx-1 overflow-x-auto rounded border border-outline-variant/10 sm:mx-0">
                  <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-surface-container-highest/80">
                        <th className="whitespace-nowrap px-2 py-2 font-label text-[9px] uppercase tracking-wider text-outline sm:px-3 sm:text-[10px]">
                          {t('sentryPage.colCheck')}
                        </th>
                        <th className="whitespace-nowrap px-2 py-2 font-label text-[9px] uppercase tracking-wider text-outline sm:px-3 sm:text-[10px]">
                          {t('sentryPage.colStatus')}
                        </th>
                        <th className="px-2 py-2 font-label text-[9px] uppercase tracking-wider text-outline sm:px-3 sm:text-[10px]">
                          {t('sentryPage.colEvidence')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {tableRows.map((row) => {
                        const ui = rowStatusUi(row, t);
                        return (
                          <tr key={row.id} className="bg-surface-container/40">
                            <td className="max-w-[140px] whitespace-normal break-words px-2 py-2 text-xs font-medium text-on-surface sm:max-w-none sm:px-3 sm:py-2.5 sm:text-sm">
                              {t(`sentryPage.${row.labelKey}`)}
                            </td>
                            <td className="whitespace-nowrap px-2 py-2 sm:px-3 sm:py-2.5">
                              <span
                                className={`inline-flex items-center gap-1.5 font-label text-[9px] uppercase sm:text-[10px] ${ui.text}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${ui.dot}`}
                                />
                                {ui.label}
                              </span>
                            </td>
                            <td className="min-w-[8rem] px-2 py-2 text-[11px] text-on-surface-variant sm:px-3 sm:py-2.5 sm:text-xs">
                              {row.evidenceI18nKey
                                ? t(`sentryPage.${row.evidenceI18nKey}`)
                                : row.evidence}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {token ? (
                <div className="flex flex-col gap-2 border-t border-outline-variant/10 pt-4 sm:flex-row sm:flex-wrap">
                  <a
                    href={TokenService.getJupiterSwapUrl(token.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="touch-manipulation inline-flex min-h-11 items-center justify-center gap-1.5 rounded border border-secondary/25 bg-secondary/10 px-3 py-2.5 text-xs font-medium text-secondary transition-colors hover:bg-secondary/20 sm:min-h-0 sm:justify-start sm:py-2"
                  >
                    <Repeat className="h-3.5 w-3.5" />
                    {t('tokenDetails.jupiter')}
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>
                  <a
                    href={TokenService.getSolscanUrl(token.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="touch-manipulation inline-flex min-h-11 items-center justify-center gap-1.5 rounded border border-primary-container/30 bg-primary-container/10 px-3 py-2.5 text-xs font-medium text-primary-container transition-colors hover:bg-primary-container/20 sm:min-h-0 sm:justify-start sm:py-2"
                  >
                    <Search className="h-3.5 w-3.5" />
                    {t('tokenDetails.solscan')}
                    <ExternalLink className="h-3 w-3 opacity-70" />
                  </a>
                  {token.url ? (
                    <a
                      href={token.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="touch-manipulation inline-flex min-h-11 items-center justify-center gap-1.5 rounded border border-primary/25 bg-primary/10 px-3 py-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 sm:min-h-0 sm:justify-start sm:py-2"
                    >
                      {t('tokenDetails.dexscreener')}
                      <ExternalLink className="h-3 w-3 opacity-70" />
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
