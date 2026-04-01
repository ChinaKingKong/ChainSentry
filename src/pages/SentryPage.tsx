import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MaterialIcon } from '../components/ui/MaterialIcon';

const TABLE_ROWS: {
  checkK: string;
  status: 'passed' | 'warning';
  evidenceK: string;
  timeK: string;
}[] = [
  { checkK: 'checkMint', status: 'passed', evidenceK: 'evidence1', timeK: 'time2m' },
  { checkK: 'checkFreeze', status: 'passed', evidenceK: 'evidence2', timeK: 'time2m' },
  { checkK: 'checkMeta', status: 'warning', evidenceK: 'evidence3', timeK: 'time4m' },
  { checkK: 'checkHolders', status: 'passed', evidenceK: 'evidence4', timeK: 'time6m' },
];

const RECENT: {
  nameK: string;
  level: 'secure' | 'critical';
  addrK: string;
  scoreK: string;
  agoK: string;
  hoverBorder: 'primary' | 'error';
}[] = [
  {
    nameK: 'recentSol',
    level: 'secure',
    addrK: 'addr1',
    scoreK: 'score98',
    agoK: 'ago14h',
    hoverBorder: 'primary',
  },
  {
    nameK: 'recentBonk',
    level: 'secure',
    addrK: 'addr2',
    scoreK: 'score84',
    agoK: 'ago1d',
    hoverBorder: 'primary',
  },
  {
    nameK: 'recentMeme',
    level: 'critical',
    addrK: 'addr3',
    scoreK: 'score12',
    agoK: 'ago2d',
    hoverBorder: 'error',
  },
  {
    nameK: 'recentPyth',
    level: 'secure',
    addrK: 'addr4',
    scoreK: 'score100',
    agoK: 'ago3d',
    hoverBorder: 'primary',
  },
];

export function SentryPage() {
  const { t, i18n } = useTranslation();
  const [caInput, setCaInput] = useState('');
  const gradId = useId().replace(/:/g, '');

  useEffect(() => {
    document.title = t('sentryPage.docTitle');
    return () => {
      document.title = i18n.t('meta.defaultTitle');
    };
  }, [t, i18n]);

  return (
    <div id="sentry-page-top" className="relative space-y-6">
      <div className="relative z-10 mb-2 max-w-xl">
        <div className="relative w-full">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-primary">
            <MaterialIcon name="search" className="text-lg" />
          </span>
          <input
            type="text"
            value={caInput}
            onChange={(e) => setCaInput(e.target.value)}
            className="w-full rounded-sm border-0 bg-surface-container-low py-2 pl-10 pr-4 font-label text-sm text-on-surface outline-none ring-1 ring-transparent transition-all placeholder:text-outline/50 focus:ring-primary"
            placeholder={t('sentryPage.caPlaceholder')}
            aria-label={t('sentryPage.caAria')}
          />
        </div>
      </div>

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
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" aria-hidden />

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
                strokeDasharray="283"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={`url(#${gradId})`}
                strokeWidth="8"
                strokeDasharray="210 283"
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
                {t('sentryPage.meterPct')}
              </span>
              <span className="font-label text-[10px] uppercase tracking-widest text-secondary">
                {t('sentryPage.secureLabel')}
              </span>
            </div>
          </div>

          <div className="relative z-10 mt-8 text-center">
            <p className="font-body text-sm text-on-surface-variant">
              {t('sentryPage.tokenPrefix')}{' '}
              <span className="font-label text-primary">{t('sentryPage.tokenDemo')}</span>
            </p>
            <p className="mt-1 break-all px-4 font-label text-[10px] opacity-40">
              {t('sentryPage.mintDemo')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-8">
          <div className="group flex flex-col justify-between border-l-2 border-secondary bg-surface-container p-6 transition-colors hover:bg-surface-container-high">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label text-[10px] uppercase tracking-widest text-outline">
                  {t('sentryPage.rugTitle')}
                </span>
                <h4 className="mt-1 font-headline text-2xl font-bold text-on-surface">
                  {t('sentryPage.rugHeading')}
                </h4>
              </div>
              <MaterialIcon name="verified_user" className="text-secondary" />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
              {t('sentryPage.rugDesc')}
            </p>
          </div>

          <div className="flex flex-col justify-between border-l-2 border-primary bg-surface-container p-6 transition-colors hover:bg-surface-container-high">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label text-[10px] uppercase tracking-widest text-outline">
                  {t('sentryPage.ownTitle')}
                </span>
                <h4 className="mt-1 font-headline text-2xl font-bold text-on-surface">
                  {t('sentryPage.ownHeading')}
                </h4>
              </div>
              <MaterialIcon name="lock_open" className="text-primary" />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
              {t('sentryPage.ownDesc')}
            </p>
          </div>

          <div className="flex flex-col justify-between border-l-2 border-tertiary-container bg-surface-container p-6 transition-colors hover:bg-surface-container-high">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label text-[10px] uppercase tracking-widest text-outline">
                  {t('sentryPage.liqTitle')}
                </span>
                <h4 className="mt-1 font-headline text-2xl font-bold text-on-surface">
                  {t('sentryPage.liqHeading')}
                </h4>
              </div>
              <MaterialIcon name="waves" className="text-tertiary-container" />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
              {t('sentryPage.liqDesc')}
            </p>
          </div>

          <div className="flex flex-col justify-between border-l-2 border-secondary bg-surface-container p-6 transition-colors hover:bg-surface-container-high">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-label text-[10px] uppercase tracking-widest text-outline">
                  {t('sentryPage.taxTitle')}
                </span>
                <h4 className="mt-1 font-headline text-2xl font-bold text-on-surface">
                  {t('sentryPage.taxHeading')}
                </h4>
              </div>
              <MaterialIcon name="percent" className="text-secondary" />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
              {t('sentryPage.taxDesc')}
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
          className="flex items-center gap-2 border border-outline-variant/30 bg-surface-container-high px-4 py-2 font-label text-xs uppercase tracking-widest transition-all hover:bg-surface-bright"
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
              {TABLE_ROWS.map((row) => (
                <tr
                  key={row.checkK}
                  className="transition-colors hover:bg-surface-container"
                >
                  <td className="px-6 py-4 font-label text-sm">
                    {t(`sentryPage.${row.checkK}`)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${row.status === 'passed' ? 'bg-secondary' : 'bg-tertiary-container'}`}
                      />
                      <span
                        className={`text-xs font-medium ${row.status === 'passed' ? 'text-secondary' : 'text-tertiary-container'}`}
                      >
                        {row.status === 'passed'
                          ? t('sentryPage.statusPassed')
                          : t('sentryPage.statusWarning')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-label text-xs opacity-60">
                    {t(`sentryPage.${row.evidenceK}`)}
                  </td>
                  <td className="px-6 py-4 text-right font-label text-xs text-on-surface-variant">
                    {t(`sentryPage.${row.timeK}`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="relative z-10 pt-6">
        <h3 className="mb-4 font-label text-[10px] uppercase tracking-[0.2em] text-outline">
          {t('sentryPage.recentTitle')}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RECENT.map((r) => (
            <button
              key={r.nameK}
              type="button"
              className={`group cursor-pointer border border-outline-variant/10 bg-surface-container-lowest p-4 text-left transition-all ${r.hoverBorder === 'error' ? 'hover:border-error/40' : 'hover:border-primary/40'}`}
            >
              <div className="mb-3 flex justify-between">
                <span className="font-headline text-xs font-bold">
                  {t(`sentryPage.${r.nameK}`)}
                </span>
                <span
                  className={`font-label text-[10px] ${r.level === 'secure' ? 'text-secondary' : 'text-error'}`}
                >
                  {r.level === 'secure'
                    ? t('sentryPage.statusSecure')
                    : t('sentryPage.statusCritical')}
                </span>
              </div>
              <div className="mb-2 truncate font-label text-[10px] opacity-40">
                {t(`sentryPage.${r.addrK}`)}
              </div>
              <div className="flex items-center justify-between font-label text-[10px] text-on-surface-variant">
                <span>
                  {t('sentryPage.scoreLabel')}: {t(`sentryPage.${r.scoreK}`)}
                </span>
                <span>{t(`sentryPage.${r.agoK}`)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
