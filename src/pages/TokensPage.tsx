import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { useTokens } from '../hooks/useTokens';
import { TokenService } from '../services/api';
import { formatTokenPrice, formatUsdCompact, shortenAddress } from '../lib/format';
import { intlLocaleFor } from '../lib/intlLocale';
import {
  riskToSentryScore,
  sentryScoreBarColor,
} from '../lib/sentryScore';
import type { Token } from '../types/token';

const CHART_BARS = [
  { h: 'h-[40%]', line: 'h-20', tone: 'secondary' as const },
  { h: 'h-[55%]', line: 'h-24', tone: 'secondary' as const },
  { h: 'h-[45%]', line: 'h-28', tone: 'error' as const },
  { h: 'h-[65%]', line: 'h-20', tone: 'secondary' as const },
  { h: 'h-[80%]', line: 'h-32', tone: 'secondary' as const },
  { h: 'h-[60%]', line: 'h-36', tone: 'error' as const },
  { h: 'h-[75%]', line: 'h-24', tone: 'secondary' as const },
];

const MOCK_TXS = [
  {
    time: '12:42:01',
    side: 'buy' as const,
    amount: '4,200',
    sym: 'SENT',
    price: '$0.4282',
    maker: '8jA…w9N',
  },
  {
    time: '12:41:45',
    side: 'sell' as const,
    amount: '12,500',
    sym: 'SENT',
    price: '$0.4278',
    maker: '4kP…v2M',
  },
  {
    time: '12:41:12',
    side: 'buy' as const,
    amount: '800',
    sym: 'SENT',
    price: '$0.4285',
    maker: '9xZ…L0P',
  },
];

function barToneClass(tone: 'secondary' | 'error', part: 'bar' | 'wick') {
  if (tone === 'error') {
    return part === 'bar' ? 'bg-error/40' : 'bg-error';
  }
  return part === 'bar' ? 'bg-secondary/60' : 'bg-secondary';
}

export function TokensPage() {
  const { t, i18n } = useTranslation();
  const locale = intlLocaleFor(i18n.language);
  const [params, setParams] = useSearchParams();
  const mint = params.get('mint');
  const [tf, setTf] = useState<'1m' | '5m' | '1h' | '1d'>('1m');
  const { tokens, loading } = useTokens(50, false, 0);

  useEffect(() => {
    document.title = t('tokensPage.docTitle');
    return () => {
      document.title = i18n.t('meta.defaultTitle');
    };
  }, [t, i18n]);

  const token: Token | null = useMemo(() => {
    if (tokens.length === 0) return null;
    if (mint) {
      const hit = tokens.find((x) => x.address === mint);
      if (hit) return hit;
    }
    return tokens[0];
  }, [mint, tokens]);

  const mcapApprox = token
    ? Math.max(token.liquidity * 2.2, token.volume_24h * 0.15)
    : 0;
  const fdvApprox = mcapApprox * 2.35;

  const jupiterUrl = token
    ? TokenService.getJupiterSwapUrl(token.address)
    : 'https://jup.ag/';

  const copyCa = () => {
    if (token?.address) void navigator.clipboard.writeText(token.address);
  };

  if (loading && !token) {
    return (
      <div
        id="tokens-page-top"
        className="relative flex min-h-[50vh] items-center justify-center text-on-surface/50"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
          <span className="font-headline text-sm">{t('tokensPage.loading')}</span>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div
        id="tokens-page-top"
        className="rounded border border-outline-variant/10 bg-surface-container p-8 text-center text-on-surface/60"
      >
        {t('tokensPage.noPairs')}
      </div>
    );
  }

  const sym = token.symbol.slice(0, 6);
  const score = riskToSentryScore(token.risk_score);
  const holderBarPct = Math.min(35, 8 + (100 - score) * 0.25);
  const closeStr =
    token.price > 0
      ? token.price.toLocaleString(locale, {
          minimumFractionDigits: 3,
          maximumFractionDigits: 3,
        })
      : t('hero.dash');

  return (
    <div id="tokens-page-top" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-20 scanline-bg"
        aria-hidden
      />

      <header className="relative z-10 mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-primary/20 bg-surface-container-highest p-2">
            <span className="font-headline text-2xl font-black text-primary">
              {sym.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface sm:text-4xl">
                {token.name}{' '}
                <span className="text-2xl text-primary/50">{token.symbol}</span>
              </h1>
              {token.risk_score === 'A' || token.risk_score === 'B' ? (
                <span className="border border-secondary/20 bg-secondary/10 px-2 py-0.5 font-label text-[10px] text-secondary">
                  {t('tokensPage.verified')}
                </span>
              ) : null}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 font-label text-xs">
              <button
                type="button"
                onClick={copyCa}
                className="text-on-surface-variant flex items-center gap-1 transition-colors hover:text-primary"
              >
                <MaterialIcon name="content_copy" className="text-sm" />
                {t('tokensPage.caLabel')} {shortenAddress(token.address, 4)}
              </button>
              <span className="text-on-surface-variant flex items-center gap-1">
                <MaterialIcon name="schedule" className="text-sm" />
                {t('tokensPage.pairAge')}
              </span>
              <span className="flex items-center gap-1 text-secondary">
                <span className="h-2 w-2 rounded-full bg-secondary" />
                {t('tokensPage.liveFeed')}
              </span>
            </div>
            <label className="mt-4 flex max-w-xs items-center gap-2 text-[10px] uppercase tracking-widest text-on-surface-variant">
              {t('tokensPage.focusPair')}
              <select
                className="flex-1 rounded border border-outline-variant/20 bg-surface-container-low px-2 py-1.5 font-headline text-xs normal-case text-on-surface"
                value={token.address}
                onChange={(e) => {
                  const v = e.target.value;
                  setParams(v ? { mint: v } : {});
                }}
              >
                {tokens.map((x) => (
                  <option key={x.address} value={x.address}>
                    {x.symbol} · {shortenAddress(x.address, 3)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="min-w-[140px] border-l-2 border-primary-container bg-surface-container-low p-4">
            <div className="mb-1 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
              {t('tokensPage.priceUsd')}
            </div>
            <div className="font-headline text-2xl font-bold text-primary">
              {formatTokenPrice(token.price)}
            </div>
            <div
              className={`mt-1 font-label text-xs ${token.change_24h >= 0 ? 'text-secondary' : 'text-error'}`}
            >
              {token.change_24h >= 0 ? '+' : ''}
              {token.change_24h.toLocaleString(locale, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
              % {t('tokensPage.h24suffix')}
            </div>
          </div>
          <div className="min-w-[140px] border-l-2 border-outline-variant/30 bg-surface-container-low p-4">
            <div className="mb-1 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
              {t('tokensPage.estMcap')}
            </div>
            <div className="font-headline text-2xl font-bold text-on-surface">
              {formatUsdCompact(mcapApprox)}
            </div>
            <div className="mt-1 font-label text-xs text-on-surface-variant">
              {t('tokensPage.fdvLine', { v: formatUsdCompact(fdvApprox) })}
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 grid grid-cols-12 gap-6">
        <div className="col-span-12 space-y-6 lg:col-span-8">
          <section className="border border-outline-variant/10 bg-surface-container p-1">
            <div className="flex flex-col gap-3 border-b border-outline-variant/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {(['1m', '5m', '1h', '1d'] as const).map((x) => (
                  <button
                    key={x}
                    type="button"
                    onClick={() => setTf(x)}
                    className={`px-3 py-1 font-label text-xs transition-colors ${
                      tf === x
                        ? 'border border-primary/30 bg-primary/20 text-primary'
                        : 'hover:bg-surface-container-high'
                    }`}
                  >
                    {x}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3 font-label text-xs sm:gap-4">
                <span className="text-secondary">
                  {t('tokensPage.ohlcO')}{' '}
                  {(token.price * 0.98).toLocaleString(locale, {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })}
                </span>
                <span className="text-error">
                  {t('tokensPage.ohlcH')}{' '}
                  {(token.price * 1.02).toLocaleString(locale, {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })}
                </span>
                <span className="text-secondary">
                  {t('tokensPage.ohlcL')}{' '}
                  {(token.price * 0.97).toLocaleString(locale, {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })}
                </span>
                <span className="text-on-surface">
                  {t('tokensPage.ohlcC')} {closeStr}
                </span>
              </div>
            </div>
            <div className="relative h-[320px] w-full bg-surface-container-lowest p-4 sm:h-[400px]">
              <div className="absolute inset-0 flex items-end justify-around gap-1 px-6 pb-10 opacity-80 sm:px-8 sm:pb-12">
                {CHART_BARS.map((b, i) => (
                  <div
                    key={i}
                    className={`relative w-full max-w-[8px] ${b.h} ${barToneClass(b.tone, 'bar')}`}
                  >
                    <div
                      className={`absolute -top-4 left-1/2 w-px -translate-x-1/2 ${b.line} ${barToneClass(b.tone, 'wick')}`}
                    />
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-0 grid grid-cols-6 grid-rows-6">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`border-outline-variant/5 ${i % 6 < 5 ? 'border-r' : ''} ${i < 30 ? 'border-b' : ''}`}
                  />
                ))}
              </div>
            </div>
          </section>

          <section className="border border-outline-variant/10 bg-surface-container">
            <div className="flex flex-col gap-3 border-b border-outline-variant/5 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-headline text-sm font-bold uppercase tracking-widest">
                {t('tokensPage.recentTx')}
              </h3>
              <div className="flex gap-4 font-label text-[10px]">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                  {t('tokensPage.buy')}
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-error" />
                  {t('tokensPage.sell')}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-label text-xs">
                <thead className="bg-surface-container-low text-on-surface-variant">
                  <tr>
                    <th className="px-6 py-3 font-medium uppercase tracking-tighter">
                      {t('tokensPage.time')}
                    </th>
                    <th className="px-6 py-3 font-medium uppercase tracking-tighter">
                      {t('tokensPage.type')}
                    </th>
                    <th className="px-6 py-3 font-medium uppercase tracking-tighter">
                      {t('tokensPage.amount')}
                    </th>
                    <th className="px-6 py-3 font-medium uppercase tracking-tighter">
                      {t('tokensPage.priceUsd')}
                    </th>
                    <th className="px-6 py-3 font-medium uppercase tracking-tighter">
                      {t('tokensPage.maker')}
                    </th>
                    <th className="px-6 py-3 text-right font-medium uppercase tracking-tighter">
                      {t('tokensPage.txn')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {MOCK_TXS.map((row) => (
                    <tr
                      key={row.time}
                      className="transition-colors hover:bg-surface-container-high"
                    >
                      <td className="px-6 py-4 text-on-surface-variant">{row.time}</td>
                      <td
                        className={`px-6 py-4 font-bold ${row.side === 'buy' ? 'text-secondary' : 'text-error'}`}
                      >
                        {row.side === 'buy' ? t('tokensPage.txBuy') : t('tokensPage.txSell')}
                      </td>
                      <td className="px-6 py-4">
                        {row.amount} {token.symbol.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4">{row.price}</td>
                      <td className="px-6 py-4 opacity-70">{row.maker}</td>
                      <td className="px-6 py-4 text-right text-primary">
                        <MaterialIcon name="open_in_new" className="text-sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-outline-variant/5 px-6 py-2 text-[10px] text-on-surface-variant/70">
              {t('tokensPage.txDisclaimer')}
            </p>
          </section>
        </div>

        <div className="col-span-12 space-y-6 lg:col-span-4">
          <section className="border border-outline-variant/10 bg-surface-container p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 font-headline text-sm font-bold text-primary">
                J
              </div>
              <h3 className="font-headline text-sm font-bold uppercase tracking-widest">
                {t('tokensPage.directSwap')}
              </h3>
            </div>
            <div className="space-y-4">
              <div className="border border-outline-variant/5 bg-surface-container-lowest p-4">
                <div className="mb-2 flex justify-between font-label text-[10px] text-on-surface-variant">
                  <span>{t('tokensPage.youPay')}</span>
                  <span>{t('tokensPage.balance')}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-headline text-2xl font-bold text-on-surface">
                    {(1).toLocaleString(locale)}
                  </span>
                  <div className="flex cursor-pointer items-center gap-2 bg-surface-container px-2 py-1">
                    <span className="text-sm font-bold">SOL</span>
                    <MaterialIcon name="expand_more" className="text-xs" />
                  </div>
                </div>
              </div>
              <div className="relative z-10 -my-3 flex justify-center">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/15 bg-surface-container text-primary">
                  <MaterialIcon name="swap_vert" className="text-sm" />
                </span>
              </div>
              <div className="border border-outline-variant/5 bg-surface-container-lowest p-4">
                <div className="mb-2 flex justify-between font-label text-[10px] text-on-surface-variant">
                  <span>{t('tokensPage.youReceive')}</span>
                  <span>{t('tokensPage.balance')}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-headline w-2/3 text-2xl font-bold text-primary">
                    {t('hero.dash')}
                  </span>
                  <div className="flex cursor-pointer items-center gap-2 bg-surface-container px-2 py-1">
                    <span className="text-sm font-bold">{token.symbol}</span>
                    <MaterialIcon name="expand_more" className="text-xs" />
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <div className="mb-4 flex justify-between px-1 font-label text-[10px]">
                  <span className="text-on-surface-variant">{t('tokensPage.routeJupiter')}</span>
                  <span className="text-secondary">{t('tokensPage.slippage')}</span>
                </div>
                <a
                  href={jupiterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full bg-primary py-4 text-center font-headline text-sm font-bold uppercase tracking-widest text-on-primary shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all hover:brightness-110"
                >
                  {t('tokensPage.executeSwap')}
                </a>
              </div>
            </div>
          </section>

          <section className="overflow-hidden border border-outline-variant/10 bg-surface-container">
            <div className="border-b border-primary/20 bg-primary/5 px-6 py-4">
              <div className="flex items-center gap-2">
                <MaterialIcon name="security" className="text-lg text-primary" filled />
                <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-primary">
                  {t('tokensPage.sentryAudit')}
                </h3>
              </div>
            </div>
            <div className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between border-l-2 border-secondary bg-surface-container-lowest p-3">
                  <div className="font-label text-xs uppercase tracking-wider text-on-surface-variant">
                    {t('tokensPage.mintAuth')}
                  </div>
                  <div className="text-xs font-bold uppercase text-secondary">
                    {t('tokensPage.unknown')}
                  </div>
                </div>
                <div className="flex items-center justify-between border-l-2 border-secondary bg-surface-container-lowest p-3">
                  <div className="font-label text-xs uppercase tracking-wider text-on-surface-variant">
                    {t('tokensPage.freezeAuth')}
                  </div>
                  <div className="text-xs font-bold uppercase text-secondary">
                    {t('tokensPage.unknown')}
                  </div>
                </div>
                <div className="flex items-center justify-between border-l-2 border-tertiary-container bg-surface-container-lowest p-3">
                  <div className="font-label text-xs uppercase tracking-wider text-on-surface-variant">
                    {t('tokensPage.liqPair')}
                  </div>
                  <div className="text-xs font-bold uppercase text-tertiary-container">
                    {formatUsdCompact(token.liquidity)}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                    {t('tokensPage.sentryScore')}
                  </div>
                  <div className="font-headline text-xl font-bold text-on-surface">
                    {score}
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden bg-surface-container-lowest">
                  <div
                    className={`h-full ${sentryScoreBarColor(score)}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <p className="text-[10px] italic text-on-surface-variant">
                  {t('tokensPage.auditHint')}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-y-4 border-t border-outline-variant/10 pt-4">
                <div>
                  <div className="mb-1 font-label text-[10px] uppercase text-on-surface-variant">
                    {t('tokensPage.pairLiq')}
                  </div>
                  <div className="font-headline text-sm font-bold text-on-surface">
                    {formatUsdCompact(token.liquidity)}
                  </div>
                </div>
                <div>
                  <div className="mb-1 font-label text-[10px] uppercase text-on-surface-variant">
                    {t('tokensPage.vol24h')}
                  </div>
                  <div className="font-headline text-sm font-bold text-on-surface">
                    {formatUsdCompact(token.volume_24h)}
                  </div>
                </div>
                <div>
                  <div className="mb-1 font-label text-[10px] uppercase text-on-surface-variant">
                    {t('tokenDetails.dex')}
                  </div>
                  <div className="font-headline text-sm font-bold text-on-surface">
                    {token.dex}
                  </div>
                </div>
                <div>
                  <div className="mb-1 font-label text-[10px] uppercase text-on-surface-variant">
                    {t('tokensPage.top10demo')}
                  </div>
                  <div className="font-headline text-sm font-bold text-on-surface">
                    {holderBarPct.toLocaleString(locale, {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                    %
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
