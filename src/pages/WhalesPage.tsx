import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MaterialIcon } from '../components/ui/MaterialIcon';

type AlertKind = 'inflow' | 'outflow' | 'critical';

const ALERT_DEFS: {
  kind: AlertKind;
  icon: string;
  iconFilled: boolean;
  usdK: string;
  badgeK: string;
  walletK: string;
  timeK: string;
  flowK: string;
}[] = [
  {
    kind: 'inflow',
    icon: 'south_east',
    iconFilled: true,
    usdK: 'usd1',
    badgeK: 'badgeMega',
    walletK: 'wallet1',
    timeK: 'time2m',
    flowK: 'flowSolAmount',
  },
  {
    kind: 'outflow',
    icon: 'north_east',
    iconFilled: false,
    usdK: 'usd2',
    badgeK: 'badgeExchange',
    walletK: 'wallet2',
    timeK: 'time5m',
    flowK: 'flowUsdcAmount',
  },
  {
    kind: 'critical',
    icon: 'rocket_launch',
    iconFilled: true,
    usdK: 'usd3',
    badgeK: 'badgeCritical',
    walletK: 'wallet3',
    timeK: 'time12m',
    flowK: 'flowSolLarge',
  },
];

function alertShellClass(kind: AlertKind): string {
  const base =
    'group bg-surface-container p-5 transition-all hover:bg-surface-container-high shadow-[0_10px_30px_-15px_rgba(7,13,31,0.5)]';
  if (kind === 'inflow') return `${base} border-l-4 border-secondary`;
  if (kind === 'outflow') return `${base} border-l-4 border-error/50`;
  return `${base} relative overflow-hidden border-l-4 border-primary`;
}

function iconBoxClass(kind: AlertKind): string {
  if (kind === 'inflow')
    return 'flex h-10 w-10 items-center justify-center rounded border border-secondary/20 bg-secondary/10';
  if (kind === 'outflow')
    return 'flex h-10 w-10 items-center justify-center rounded border border-error/20 bg-error/10';
  return 'flex h-10 w-10 items-center justify-center rounded border border-primary/20 bg-primary/10';
}

function iconColor(kind: AlertKind): string {
  if (kind === 'inflow') return 'text-secondary';
  if (kind === 'outflow') return 'text-error';
  return 'text-primary';
}

function badgeClass(kind: AlertKind): string {
  if (kind === 'inflow')
    return 'rounded bg-secondary/10 px-2 py-0.5 font-label text-xs uppercase text-secondary';
  if (kind === 'outflow')
    return 'rounded bg-error/5 px-2 py-0.5 font-label text-xs uppercase text-error/70';
  return 'pulse-glow rounded bg-primary/20 px-2 py-0.5 font-label text-xs uppercase text-primary';
}

export function WhalesPage() {
  const { t, i18n } = useTranslation();
  const [minAmt, setMinAmt] = useState('10k');
  const [tokenFilter, setTokenFilter] = useState('all');
  const [walletQ, setWalletQ] = useState('');

  useEffect(() => {
    document.title = t('whalesPage.docTitle');
    return () => {
      document.title = i18n.t('meta.defaultTitle');
    };
  }, [t, i18n]);

  const minOptions = useMemo(
    () =>
      [
        { v: '10k', labelK: 'min10k' },
        { v: '50k', labelK: 'min50k' },
        { v: '100k', labelK: 'min100k' },
        { v: '1m', labelK: 'min1m' },
      ] as const,
    []
  );

  const tokenOptions = useMemo(
    () =>
      [
        { v: 'all', label: () => t('whalesPage.allAssets') },
        { v: 'SOL', label: () => 'SOL' },
        { v: 'USDC', label: () => 'USDC' },
        { v: 'BONK', label: () => 'BONK' },
      ] as const,
    [t]
  );

  const selectField =
    'scheme-dark w-full cursor-pointer appearance-none border-0 bg-transparent p-0 font-label text-sm text-on-surface outline-none ring-0 focus:ring-0';

  const inputField =
    'w-full border-0 bg-transparent p-0 font-label text-sm text-on-surface outline-none ring-0 placeholder:text-outline/40 focus:ring-0';

  return (
    <div id="whales-page-top" className="relative">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12] scanline-bg"
        aria-hidden
      />

      <div className="relative z-10 mb-12 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="pulse-glow h-2 w-2 rounded-full bg-primary" />
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary">
              {t('whalesPage.liveMonitoring')}
            </span>
          </div>
          <h1 className="font-headline text-4xl font-bold leading-tight tracking-tight text-on-surface md:text-5xl">
            {t('whalesPage.title')}{' '}
            <span className="text-primary-container">{t('whalesPage.version')}</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-outline-variant/15 bg-surface-container-low p-2">
          <div className="flex flex-col px-3">
            <span className="mb-1 font-label text-[9px] uppercase text-outline">
              {t('whalesPage.filterMinAmount')}
            </span>
            <select
              className={selectField}
              value={minAmt}
              onChange={(e) => setMinAmt(e.target.value)}
              aria-label={t('whalesPage.filterMinAmount')}
            >
              {minOptions.map((o) => (
                <option key={o.v} value={o.v}>
                  {t(`whalesPage.${o.labelK}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden h-8 w-px bg-outline-variant/20 sm:block" />
          <div className="flex flex-col px-3">
            <span className="mb-1 font-label text-[9px] uppercase text-outline">
              {t('whalesPage.filterToken')}
            </span>
            <select
              className={selectField}
              value={tokenFilter}
              onChange={(e) => setTokenFilter(e.target.value)}
              aria-label={t('whalesPage.filterToken')}
            >
              {tokenOptions.map((o) => (
                <option key={o.v} value={o.v}>
                  {o.label()}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden h-8 w-px bg-outline-variant/20 sm:block" />
          <div className="min-w-[150px] flex-1 flex-col px-3">
            <span className="mb-1 font-label text-[9px] uppercase text-outline">
              {t('whalesPage.filterWallet')}
            </span>
            <input
              className={inputField}
              type="text"
              value={walletQ}
              onChange={(e) => setWalletQ(e.target.value)}
              placeholder={t('whalesPage.walletPlaceholder')}
              aria-label={t('whalesPage.filterWallet')}
            />
          </div>
          <button
            type="button"
            className="p-2.5 text-primary transition-colors hover:bg-primary-container/40 bg-primary-container/20"
            aria-label={t('whalesPage.filterAria')}
          >
            <MaterialIcon name="filter_list" className="text-lg" />
          </button>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <div className="mb-4 flex items-center justify-between px-2">
            <h2 className="font-label text-sm font-bold uppercase tracking-widest text-outline">
              {t('whalesPage.alertsTitle')}
            </h2>
            <div className="flex items-center gap-4 font-label text-[10px] uppercase tracking-widest">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                {t('whalesPage.legendInflow')}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-error" />
                {t('whalesPage.legendOutflow')}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {ALERT_DEFS.map((row) => (
              <div
                key={row.kind + row.usdK}
                className={alertShellClass(row.kind)}
              >
                {row.kind === 'critical' ? (
                  <div className="pointer-events-none absolute inset-0 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
                ) : null}
                <div
                  className={`flex flex-col justify-between gap-4 md:flex-row md:items-center ${row.kind === 'critical' ? 'relative z-10' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 ${iconBoxClass(row.kind)}`}>
                      <MaterialIcon
                        name={row.icon}
                        className={iconColor(row.kind)}
                        filled={row.iconFilled}
                      />
                    </div>
                    <div>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="font-headline text-xl font-bold text-on-surface">
                          {t(`whalesPage.${row.usdK}`)}
                        </span>
                        <span className={badgeClass(row.kind)}>
                          {t(`whalesPage.${row.badgeK}`)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 font-label text-[11px] uppercase tracking-wider text-outline">
                        <span className="flex items-center gap-1">
                          <MaterialIcon
                            name="account_balance_wallet"
                            className="text-xs"
                          />
                          {t(`whalesPage.${row.walletK}`)}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-outline-variant" />
                        <span className="flex items-center gap-1">
                          <MaterialIcon name="history" className="text-xs" />
                          {t(`whalesPage.${row.timeK}`)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-headline text-sm font-bold text-on-surface">
                        {t(`whalesPage.${row.flowK}`)}
                      </div>
                      <div className="font-label text-[10px] uppercase text-outline">
                        {t('whalesPage.assetFlow')}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="border border-outline-variant/30 p-2 text-outline transition-all hover:border-primary/50 hover:text-primary"
                      aria-label={t('whalesPage.viewTrace')}
                    >
                      <MaterialIcon name="visibility" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8 lg:col-span-4">
          <div className="rounded-sm border border-outline-variant/15 bg-surface-container-low p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary">
                {t('whalesPage.activeProfile')}
              </h3>
              <div className="flex items-center gap-2">
                <span className="font-label text-[10px] uppercase text-secondary">
                  {t('whalesPage.following')}
                </span>
                <div className="flex h-4 w-8 items-center rounded-full bg-secondary/20 px-0.5">
                  <div className="ml-auto h-3 w-3 rounded-full bg-secondary" />
                </div>
              </div>
            </div>

            <div className="mb-8 flex items-center gap-4">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded border-2 border-primary/20 bg-surface-container-low">
                  <MaterialIcon
                    name="capture"
                    className="text-3xl text-primary"
                    filled
                  />
                </div>
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-secondary-container">
                  <MaterialIcon
                    name="verified"
                    className="text-[12px] text-on-secondary"
                    filled
                  />
                </span>
              </div>
              <div>
                <h4 className="font-headline text-lg font-bold uppercase tracking-tight text-on-surface">
                  {t('whalesPage.profileName')}
                </h4>
                <p className="font-label text-xs tracking-wider text-outline">
                  {t('whalesPage.profileAddr')}
                </p>
              </div>
            </div>

            <div className="mb-8 space-y-4">
              <div>
                <div className="mb-1.5 flex justify-between font-label text-[10px] uppercase tracking-widest text-outline">
                  <span>{t('whalesPage.topHoldings')}</span>
                  <span>{t('whalesPage.allocation')}</span>
                </div>
                <div className="space-y-2">
                  {(
                    [
                      ['holdingSol', 'pct62', 'S'],
                      ['holdingUsdc', 'pct24', 'U'],
                      ['holdingBonk', 'pct14', 'B'],
                    ] as const
                  ).map(([hk, pk, letter]) => (
                    <div
                      key={hk}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-container text-[10px] font-bold text-on-surface">
                          {letter}
                        </div>
                        <span className="font-label text-xs text-on-surface">
                          {t(`whalesPage.${hk}`)}
                        </span>
                      </div>
                      <span className="font-label text-xs text-on-surface">
                        {t(`whalesPage.${pk}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-sm border border-outline-variant/10 bg-surface-container-high p-3">
                <div className="mb-1 font-label text-[9px] uppercase tracking-widest text-outline">
                  {t('whalesPage.totalValue')}
                </div>
                <div className="font-headline text-sm font-bold text-on-surface">
                  {t('whalesPage.totalValueAmt')}
                </div>
              </div>
              <div className="rounded-sm border border-outline-variant/10 bg-surface-container-high p-3">
                <div className="mb-1 font-label text-[9px] uppercase tracking-widest text-outline">
                  {t('whalesPage.winRate')}
                </div>
                <div className="font-headline text-sm font-bold text-secondary">
                  {t('whalesPage.winRateAmt')}
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-sm border border-outline-variant/15 bg-surface-container-low p-6">
            <div className="absolute right-0 top-0 p-4">
              <MaterialIcon
                name="insights"
                className="text-6xl text-primary/10"
              />
            </div>
            <h3 className="mb-6 font-label text-xs font-bold uppercase tracking-[0.2em] text-outline">
              {t('whalesPage.marketFlow24h')}
            </h3>
            <div className="relative z-10 space-y-6">
              <div>
                <div className="mb-2 flex items-end justify-between">
                  <div className="font-label text-[10px] uppercase text-on-surface">
                    {t('whalesPage.globalInflow')}
                  </div>
                  <div className="font-headline text-lg font-bold text-secondary">
                    {t('whalesPage.globalInflowAmt')}
                  </div>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container-highest">
                  <div className="h-full w-3/4 bg-secondary" />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-end justify-between">
                  <div className="font-label text-[10px] uppercase text-on-surface">
                    {t('whalesPage.globalOutflow')}
                  </div>
                  <div className="font-headline text-lg font-bold text-error">
                    {t('whalesPage.globalOutflowAmt')}
                  </div>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container-highest">
                  <div className="h-full w-1/4 bg-error" />
                </div>
              </div>
              <div className="border-t border-outline-variant/10 pt-4">
                <div className="flex items-center gap-2 font-label text-[11px] uppercase tracking-wider text-outline">
                  <MaterialIcon name="info" className="text-xs text-primary" />
                  <span>{t('whalesPage.sentiment')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="relative z-10 mt-20 flex flex-col items-center justify-between gap-8 border-t border-outline-variant/10 pt-12 md:flex-row">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="mb-1 font-label text-[10px] uppercase tracking-[0.3em] text-outline">
              {t('whalesPage.footerStatus')}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-primary-container px-2 py-0.5 font-label text-[10px] font-bold uppercase tracking-widest text-on-primary-container">
                {t('whalesPage.v2Beta')}
              </span>
              <span className="font-label text-xs text-on-surface">
                {t('whalesPage.alphaDone')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 font-label text-[10px] uppercase tracking-[0.2em] text-outline">
          <a className="transition-colors hover:text-primary" href="#">
            {t('whalesPage.linkApi')}
          </a>
          <a className="transition-colors hover:text-primary" href="#">
            {t('whalesPage.linkNodes')}
          </a>
          <a className="transition-colors hover:text-primary" href="#">
            {t('whalesPage.linkGov')}
          </a>
        </div>
      </footer>
    </div>
  );
}
