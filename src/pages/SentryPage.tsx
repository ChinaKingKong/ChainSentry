import { useEffect, useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { useSentryAudit, type SentryCheckRow } from '../hooks/useSentryAudit';
import { useTokens } from '../hooks/useTokens';
import { formatUsdCompact } from '../lib/format';
import { riskToSentryScore } from '../lib/sentryScore';

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

export function SentryPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const gradId = useId().replace(/:/g, '');
  const {
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
  } = useSentryAudit();

  const { tokens: watchTokens } = useTokens(8, false, 0);
  const [caQuery, setCaQuery] = useState('');

  useEffect(() => {
    document.title = t('sentryPage.docTitle');
    return () => {
      document.title = i18n.t('meta.defaultTitle');
    };
  }, [t, i18n]);

  const dashOffset = useMemo(() => {
    if (score == null) return `0 ${CIRC}`;
    const active = (score / 100) * CIRC;
    return `${active} ${CIRC}`;
  }, [score]);

  const meterSub = useMemo(() => {
    if (score == null) return t('sentryPage.secureLabel');
    if (score >= 72) return t('sentryPage.secureLabel');
    if (score >= 48) return t('sentryPage.meterModerate');
    return t('sentryPage.meterPoor');
  }, [score, t]);

  const rugBlock = useMemo(() => {
    if (!audit) {
      return {
        title: t('sentryPage.rugTitle'),
        heading: t('sentryPage.rugHeading'),
        body: t('sentryPage.preAnalyzeHint'),
      };
    }
    if (!audit.mintAuthorityDisabled) {
      return {
        title: t('sentryPage.rugTitle'),
        heading: t('sentryPage.rugHeadingCritical'),
        body: t('sentryPage.rugDescMintOpen'),
      };
    }
    if (audit.top10HolderPct > 55) {
      return {
        title: t('sentryPage.rugTitle'),
        heading: t('sentryPage.rugHeadingWarn'),
        body: t('sentryPage.rugDescConc', {
          pct: audit.top10HolderPct.toFixed(1),
        }),
      };
    }
    return {
      title: t('sentryPage.rugTitle'),
      heading: t('sentryPage.rugHeading'),
      body: t('sentryPage.rugDescSafe'),
    };
  }, [audit, t]);

  const ownBlock = useMemo(() => {
    if (!audit) {
      return {
        heading: t('sentryPage.ownHeading'),
        body: t('sentryPage.preAnalyzeHint'),
      };
    }
    if (audit.mintAuthorityDisabled && audit.freezeAuthorityRemoved) {
      return {
        heading: t('sentryPage.ownHeading'),
        body: t('sentryPage.ownDesc'),
      };
    }
    return {
      heading: t('sentryPage.ownHeadingPartial'),
      body: t('sentryPage.ownDescPartial'),
    };
  }, [audit, t]);

  const liqBlock = useMemo(() => {
    if (!audit) {
      return {
        heading: t('sentryPage.liqHeading'),
        body: t('sentryPage.preAnalyzeHint'),
      };
    }
    if (liquidityUsd != null && pair) {
      return {
        heading: formatUsdCompact(liquidityUsd),
        body: t('sentryPage.liqDescDex', { dex: pair.dexId || '—' }),
      };
    }
    return {
      heading: t('sentryPage.liqUnknown'),
      body: t('sentryPage.liqDesc'),
    };
  }, [audit, liquidityUsd, pair, t]);

  return (
    <div id="sentry-page-top" className="relative space-y-6">
      <div className="relative z-10 flex max-w-xl flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-primary">
            <MaterialIcon name="search" className="text-lg" />
          </span>
          <input
            type="text"
            id="sentry-ca-input"
            value={caQuery}
            onChange={(e) => setCaQuery(e.target.value)}
            className="w-full rounded-sm border-0 bg-surface-container-low py-2 pl-10 pr-4 font-label text-sm text-on-surface outline-none ring-1 ring-transparent transition-all placeholder:text-outline/50 focus:ring-primary"
            placeholder={t('sentryPage.caPlaceholder')}
            aria-label={t('sentryPage.caAria')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void analyze(caQuery);
            }}
          />
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => void analyze(caQuery)}
          className="shrink-0 rounded-sm bg-primary-container px-4 py-2 font-label text-xs font-bold uppercase tracking-widest text-on-primary-container transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          {loading ? t('sentryPage.analyzing') : t('sentryPage.analyze')}
        </button>
      </div>

      {errorKey ? (
        <div className="rounded border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          {errorKey.startsWith('sentryErrors.')
            ? t(errorKey)
            : errorKey}
        </div>
      ) : null}

      <section className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="relative flex flex-col items-center justify-center overflow-hidden bg-surface-container-low p-8 lg:col-span-4">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            aria-hidden
            style={{
              backgroundImage: `
                linear-gradient(rgba(34, 211, 238, 0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(34, 211, 238, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: '28px 28px',
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"
            aria-hidden
          />

          <h3 className="relative z-10 mb-8 font-label text-[10px] uppercase tracking-[0.2em] text-primary">
            {t('sentryPage.threatAssessment')}
          </h3>

          <div className="relative z-10 flex h-48 w-48 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--color-surface-container-low)"
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
                <linearGradient id={gradId} x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="#ffb4ab" />
                  <stop offset="50%" stopColor="#ffb147" />
                  <stop offset="100%" stopColor="#4edea3" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-headline text-4xl font-bold text-secondary">
                {score != null ? `${score}%` : '—'}
              </span>
              <span className="font-label text-[10px] uppercase tracking-widest text-secondary">
                {meterSub}
              </span>
            </div>
          </div>

          <div className="relative z-10 mt-8 text-center">
            <p className="font-body text-sm text-on-surface-variant">
              {t('sentryPage.tokenPrefix')}{' '}
              <span className="font-label text-primary">
                {symbol || t('sentryPage.tokenDemo')}
              </span>
            </p>
            <p className="mt-1 break-all px-4 font-label text-[10px] opacity-40">
              {audit?.mint ?? t('sentryPage.mintDemo')}
            </p>
            {displayName && symbol ? (
              <p className="mt-1 text-[10px] text-on-surface-variant/70">
                {displayName}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-8">
          <div className="group flex flex-col justify-between border-l-2 border-secondary bg-surface-container p-6 transition-colors hover:bg-surface-container-high">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label text-[10px] uppercase tracking-widest text-outline">
                  {rugBlock.title}
                </span>
                <h4 className="mt-1 font-headline text-2xl font-bold text-on-surface">
                  {rugBlock.heading}
                </h4>
              </div>
              <MaterialIcon name="verified_user" className="text-secondary" />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
              {rugBlock.body}
            </p>
          </div>

          <div className="flex flex-col justify-between border-l-2 border-primary bg-surface-container p-6 transition-colors hover:bg-surface-container-high">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label text-[10px] uppercase tracking-widest text-outline">
                  {t('sentryPage.ownTitle')}
                </span>
                <h4 className="mt-1 font-headline text-2xl font-bold text-on-surface">
                  {ownBlock.heading}
                </h4>
              </div>
              <MaterialIcon name="lock_open" className="text-primary" />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
              {ownBlock.body}
            </p>
          </div>

          <div className="flex flex-col justify-between border-l-2 border-tertiary-container bg-surface-container p-6 transition-colors hover:bg-surface-container-high">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label text-[10px] uppercase tracking-widest text-outline">
                  {t('sentryPage.liqTitle')}
                </span>
                <h4 className="mt-1 font-headline text-2xl font-bold text-on-surface">
                  {liqBlock.heading}
                </h4>
              </div>
              <MaterialIcon name="waves" className="text-tertiary-container" />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
              {liqBlock.body}
            </p>
          </div>

          <div className="flex flex-col justify-between border-l-2 border-secondary bg-surface-container p-6 transition-colors hover:bg-surface-container-high">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label text-[10px] uppercase tracking-widest text-outline">
                  {t('sentryPage.taxTitle')}
                </span>
                <h4 className="mt-1 font-headline text-2xl font-bold text-on-surface">
                  {audit ? t('sentryPage.taxHeading') : t('sentryPage.taxHeading')}
                </h4>
              </div>
              <MaterialIcon name="percent" className="text-secondary" />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
              {audit ? t('sentryPage.taxSplStandard') : t('sentryPage.preAnalyzeHint')}
            </p>
          </div>
        </div>
      </section>

      <div className="relative z-10 flex flex-col items-end justify-between gap-4 border-b border-outline-variant/15 pb-4 md:flex-row">
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface">
            {t('sentryPage.vulnTitle')}
          </h2>
          <p className="text-sm text-on-surface-variant">{t('sentryPage.vulnSubtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 border border-outline-variant/30 bg-surface-container-high px-4 py-2 font-label text-xs uppercase tracking-widest transition-all hover:bg-surface-bright print:hidden"
        >
          <MaterialIcon name="picture_as_pdf" className="text-sm" />
          {t('sentryPage.exportReport')}
        </button>
      </div>

      <div className="relative z-10 overflow-hidden bg-surface-container-low">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container-low">
                <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-outline">
                  {t('sentryPage.colCheck')}
                </th>
                <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-outline">
                  {t('sentryPage.colStatus')}
                </th>
                <th className="px-6 py-4 font-label text-[10px] uppercase tracking-[0.2em] text-outline">
                  {t('sentryPage.colEvidence')}
                </th>
                <th className="px-6 py-4 text-right font-label text-[10px] uppercase tracking-[0.2em] text-outline">
                  {t('sentryPage.colVerified')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {(tableRows.length ? tableRows : []).map((row) => {
                const ui = rowStatusUi(row, t);
                return (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-surface-container"
                  >
                    <td className="px-6 py-4 font-label text-sm">
                      {t(`sentryPage.${row.labelKey}`)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${ui.dot}`} />
                        <span className={`text-xs font-medium ${ui.text}`}>
                          {ui.label}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-[200px] truncate px-6 py-4 font-label text-xs opacity-60 sm:max-w-none">
                      {row.evidenceI18nKey
                        ? t(`sentryPage.${row.evidenceI18nKey}`)
                        : row.evidence}
                    </td>
                    <td className="px-6 py-4 text-right font-label text-xs text-on-surface-variant">
                      {row.timeLabel}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!tableRows.length ? (
            <p className="px-6 py-8 text-center text-sm text-on-surface-variant">
              {t('sentryPage.preAnalyzeHint')}
            </p>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 pt-6">
        <h3 className="mb-4 font-label text-[10px] uppercase tracking-[0.2em] text-outline">
          {t('sentryPage.recentTitle')}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {watchTokens.map((tok) => {
            const sc = riskToSentryScore(tok.risk_score);
            const critical = tok.risk_score === 'D';
            const secure = tok.risk_score === 'A' || tok.risk_score === 'B';
            return (
              <button
                key={tok.address}
                type="button"
                onClick={() =>
                  navigate(`/tokens?mint=${encodeURIComponent(tok.address)}`)
                }
                className={`group cursor-pointer border border-outline-variant/10 bg-surface-container-lowest p-4 text-left transition-all ${critical ? 'hover:border-error/40' : 'hover:border-primary/40'}`}
              >
                <div className="mb-3 flex justify-between">
                  <span className="font-headline text-xs font-bold">
                    {tok.symbol}
                  </span>
                  <span
                    className={`font-label text-[10px] ${secure ? 'text-secondary' : critical ? 'text-error' : 'text-tertiary-container'}`}
                  >
                    {critical
                      ? t('whalesPage.statusCritical')
                      : secure
                        ? t('whalesPage.statusSecure')
                        : t('sentryPage.statusWarning')}
                  </span>
                </div>
                <div className="mb-2 truncate font-label text-[10px] opacity-40">
                  {tok.address.slice(0, 4)}…{tok.address.slice(-4)}
                </div>
                <div className="flex items-center justify-between font-label text-[10px] text-on-surface-variant">
                  <span>
                    {t('sentryPage.scoreLabel')}: {sc}/100
                  </span>
                  <span>{t('whalesPage.feedLive')}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
