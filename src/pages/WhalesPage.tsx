import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { useTokens } from '../hooks/useTokens';
import { formatUsdCompact, shortenAddress } from '../lib/format';
import { mergeTokensByMint } from '../lib/mergeTokensByMint';
import { TokenService } from '../services/api';
import { fetchLatestTxForWhaleAlert } from '../services/pairActivity';
import {
  fetchWhaleSnapshotsChunked,
  type WhaleHolderSnapshot,
} from '../services/whaleHolders';
import type { Token } from '../types/token';

type AlertKind = 'inflow' | 'outflow' | 'critical';

/** RPC 未返回签名时的回退：池子或 mint 账户页 */
function whaleAlertSolscanFallbackUrl(tkn: Token): string {
  const pair = tkn.pair_address?.trim();
  if (pair) return TokenService.getSolscanAccountUrl(pair);
  return TokenService.getSolscanAccountUrl(tkn.address);
}

const MIN_THRESH: Record<string, number> = {
  '10k': 10_000,
  '50k': 50_000,
  '100k': 100_000,
  '1m': 1_000_000,
};

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
  if (kind === 'critical')
    return 'pulse-glow rounded bg-primary/20 px-2 py-0.5 font-label text-xs uppercase text-primary';
  if (kind === 'inflow')
    return 'rounded bg-secondary/10 px-2 py-0.5 font-label text-xs uppercase text-secondary';
  return 'rounded bg-error/5 px-2 py-0.5 font-label text-xs uppercase text-error/70';
}

function pickBadgeKey(
  kind: AlertKind,
  notional: number,
  change24: number
): string {
  if (kind === 'critical') return 'badgeCritical';
  if (notional >= 800_000) return 'badgeMega';
  if (notional >= 200_000) return 'badgeVolSurge';
  if (change24 < -4) return 'badgeExchange';
  return 'badgeActive';
}

function formatWhaleUiAmount(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  if (n >= 1) return n >= 100 ? String(Math.round(n)) : n.toFixed(2);
  return n.toPrecision(4);
}

export function WhalesPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [minAmt, setMinAmt] = useState('10k');
  const [tokenFilter, setTokenFilter] = useState('all');
  const [walletQ, setWalletQ] = useState('');
  const [whaleSnapshotByMint, setWhaleSnapshotByMint] = useState<
    Record<string, WhaleHolderSnapshot>
  >({});
  /** 巨鲸钱包无最近签名时，用池/mint 最近交易补全，保证整行可打开 tx hash */
  const [poolTxSigByMint, setPoolTxSigByMint] = useState<Record<string, string>>(
    {}
  );
  const [rpcHoldersReady, setRpcHoldersReady] = useState(false);
  const memeFeed = useTokens(64, false, 0, 'meme');
  const defiFeed = useTokens(64, false, 0, 'defi');
  const tokensLoading = memeFeed.loading || defiFeed.loading;
  const tokens = useMemo(
    () => mergeTokensByMint([memeFeed.tokens, defiFeed.tokens], 96),
    [memeFeed.tokens, defiFeed.tokens]
  );

  const baseWhaleAlerts = useMemo(() => {
    const thr = MIN_THRESH[minAmt] ?? 10_000;
    let list = tokens.filter(
      (x) => Math.max(x.volume_24h, x.liquidity * 0.2) >= thr
    );
    if (tokenFilter !== 'all') {
      list = list.filter(
        (x) => x.symbol.toUpperCase() === tokenFilter.toUpperCase()
      );
    }
    return list.slice(0, 24);
  }, [tokens, minAmt, tokenFilter]);

  const filteredAlerts = useMemo(() => {
    const q = walletQ.trim().toLowerCase();
    if (!q) return baseWhaleAlerts;
    return baseWhaleAlerts.filter((x) => {
      const w = whaleSnapshotByMint[x.address]?.ownerWallet;
      return (
        x.address.toLowerCase().includes(q) ||
        x.symbol.toLowerCase().includes(q) ||
        x.name.toLowerCase().includes(q) ||
        (w != null && w.toLowerCase().includes(q))
      );
    });
  }, [baseWhaleAlerts, walletQ, whaleSnapshotByMint]);

  useEffect(() => {
    if (filteredAlerts.length === 0) {
      setWhaleSnapshotByMint({});
      setPoolTxSigByMint({});
      setRpcHoldersReady(true);
      return;
    }
    setRpcHoldersReady(false);
    let cancelled = false;
    const mints = filteredAlerts.map((t) => t.address);
    void (async () => {
      const map = await fetchWhaleSnapshotsChunked(mints, 4);
      if (cancelled) return;
      setWhaleSnapshotByMint(map);

      const needPoolTx = filteredAlerts.filter(
        (t) => !map[t.address]?.recentSignature
      );
      const sigByMint: Record<string, string> = {};
      const CHUNK = 4;
      for (let i = 0; i < needPoolTx.length; i += CHUNK) {
        if (cancelled) return;
        const slice = needPoolTx.slice(i, i + CHUNK);
        const part = await Promise.all(
          slice.map((tkn) => fetchLatestTxForWhaleAlert(tkn))
        );
        slice.forEach((tkn, j) => {
          const sig = part[j];
          if (sig) sigByMint[tkn.address] = sig;
        });
      }
      if (cancelled) return;
      setPoolTxSigByMint(sigByMint);
      setRpcHoldersReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [filteredAlerts]);

  /** 侧栏统计：仍按列表内代币流动性 / 24h 涨跌聚合（非单钱包资金流） */
  const sortedByNotional = useMemo(() => {
    return [...filteredAlerts].sort((a, b) => {
      const na = Math.max(a.volume_24h, a.liquidity * 0.25);
      const nb = Math.max(b.volume_24h, b.liquidity * 0.25);
      return nb - na;
    });
  }, [filteredAlerts]);

  const leadToken = sortedByNotional[0] ?? null;
  const leadWhaleWallet =
    leadToken != null
      ? (whaleSnapshotByMint[leadToken.address]?.ownerWallet ?? null)
      : null;

  const topHoldingsRows = useMemo(() => {
    if (sortedByNotional.length === 0) return [];
    const byLiq = [...sortedByNotional]
      .sort((a, b) => b.liquidity - a.liquidity)
      .slice(0, 3);
    const sumLiq = byLiq.reduce((s, t) => s + t.liquidity, 0) || 1;
    return byLiq.map((t) => ({
      token: t,
      pct: (t.liquidity / sumLiq) * 100,
    }));
  }, [sortedByNotional]);

  const totalTrackedLiquidity = useMemo(
    () => sortedByNotional.reduce((s, t) => s + t.liquidity, 0),
    [sortedByNotional]
  );

  const samplePositive24hPct = useMemo(() => {
    if (sortedByNotional.length === 0) return null;
    const up = sortedByNotional.filter((t) => t.change_24h >= 0).length;
    return Math.round((100 * up) / sortedByNotional.length);
  }, [sortedByNotional]);

  const flow24h = useMemo(() => {
    let volUp = 0;
    let volDown = 0;
    for (const t of sortedByNotional) {
      if (t.change_24h >= 0) volUp += t.volume_24h;
      else volDown += t.volume_24h;
    }
    const total = volUp + volDown || 1;
    return {
      volUp,
      volDown,
      upBarPct: (volUp / total) * 100,
      downBarPct: (volDown / total) * 100,
    };
  }, [sortedByNotional]);

  const flowSentimentKey = useMemo(() => {
    if (samplePositive24hPct == null) return null;
    if (samplePositive24hPct >= 66) return 'whalesPage.sentimentStrongBull';
    if (samplePositive24hPct >= 40) return 'whalesPage.sentimentNeutralLeanUp';
    if (samplePositive24hPct >= 25) return 'whalesPage.sentimentNeutral';
    return 'whalesPage.sentimentBearLean';
  }, [samplePositive24hPct]);

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
          <p className="mt-3 max-w-xl font-label text-xs leading-relaxed text-on-surface/55">
            {t('whalesPage.methodology')}
          </p>
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
                {t('whalesPage.legendPriceUp')}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-error" />
                {t('whalesPage.legendPriceDown')}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {tokensLoading && filteredAlerts.length === 0 ? (
              <div className="flex items-center justify-center gap-3 py-16 text-on-surface/50">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
                <span className="font-headline text-sm">{t('dashboard.syncing')}</span>
              </div>
            ) : null}
            {!tokensLoading && filteredAlerts.length === 0 ? (
              <div className="rounded border border-outline-variant/10 bg-surface-container-low/50 py-12 text-center text-sm text-on-surface-variant">
                {t('hotTable.noMatch')}
              </div>
            ) : null}
            {filteredAlerts.map((tkn) => {
              const notional = Math.max(tkn.volume_24h, tkn.liquidity * 0.25);
              const snap = whaleSnapshotByMint[tkn.address];
              const holderUsdEst =
                snap != null && tkn.price > 0
                  ? snap.uiAmount * tkn.price
                  : null;
              const displayUsd = holderUsdEst ?? notional;
              const critical =
                tkn.risk_score === 'D' && displayUsd >= 120_000;
              const kind: AlertKind = critical
                ? 'critical'
                : tkn.change_24h >= 0
                  ? 'inflow'
                  : 'outflow';
              const icon =
                tkn.change_24h >= 0 ? 'arrow_upward' : 'arrow_downward';
              const iconFilled = true;
              const badgeK = pickBadgeKey(kind, displayUsd, tkn.change_24h);
              const flowLine = `${tkn.symbol} · ${formatUsdCompact(tkn.liquidity)}`;
              const whaleWallet = snap?.ownerWallet ?? null;
              const txSig =
                snap?.recentSignature ?? poolTxSigByMint[tkn.address];
              const rowExplorerHref = txSig
                ? TokenService.getSolscanTxUrl(txSig)
                : whaleAlertSolscanFallbackUrl(tkn);

              const openRowExplorer = () => {
                const w = window.open(rowExplorerHref, '_blank');
                if (w) w.opener = null;
              };

              return (
                <div
                  key={tkn.address}
                  role="button"
                  tabIndex={0}
                  className={`${alertShellClass(kind)} cursor-pointer`}
                  onClick={openRowExplorer}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openRowExplorer();
                    }
                  }}
                  aria-label={t('whalesPage.openAlertRowOnExplorer')}
                >
                  {kind === 'critical' ? (
                    <div className="pointer-events-none absolute inset-0 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
                  ) : null}
                  <div
                    className={`flex flex-col justify-between gap-4 md:flex-row md:items-center ${kind === 'critical' ? 'relative z-10' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 ${iconBoxClass(kind)}`}>
                        <MaterialIcon
                          name={icon}
                          className={iconColor(kind)}
                          filled={iconFilled}
                        />
                      </div>
                      <div>
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="font-headline text-xl font-bold text-on-surface">
                            {formatUsdCompact(displayUsd)}
                          </span>
                          <span className={badgeClass(kind)}>
                            {t(`whalesPage.${badgeK}`)}
                          </span>
                        </div>
                        {snap ? (
                          <p className="mb-1 font-mono text-[10px] text-on-surface/45">
                            {t('whalesPage.holderLine', {
                              amount: formatWhaleUiAmount(snap.uiAmount),
                              symbol: tkn.symbol,
                            })}
                          </p>
                        ) : null}
                        <div className="flex flex-wrap items-center gap-3 font-label text-[11px] uppercase tracking-wider text-outline">
                          {whaleWallet ? (
                            <a
                              href={TokenService.getSolscanAccountUrl(
                                whaleWallet
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-inherit transition-colors hover:text-primary"
                              aria-label={t('whalesPage.openWhaleWalletExplorer')}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MaterialIcon
                                name="account_balance_wallet"
                                className="text-xs"
                              />
                              {shortenAddress(whaleWallet, 4)}
                            </a>
                          ) : !rpcHoldersReady ? (
                            <span
                              className="flex items-center gap-1 text-on-surface/35"
                              title={t('whalesPage.walletPendingHint')}
                            >
                              <MaterialIcon
                                name="account_balance_wallet"
                                className="text-xs"
                              />
                              {t('whalesPage.walletPending')}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-on-surface/35">
                              <MaterialIcon
                                name="account_balance_wallet"
                                className="text-xs"
                              />
                              {t('whalesPage.holderRpcEmpty')}
                            </span>
                          )}
                          <span className="h-1 w-1 rounded-full bg-outline-variant" />
                          <span className="flex items-center gap-1">
                            <MaterialIcon name="history" className="text-xs" />
                            {t('whalesPage.feedLive')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-headline text-sm font-bold text-on-surface">
                          {flowLine}
                        </div>
                        <div className="font-label text-[10px] uppercase text-outline">
                          {t('whalesPage.assetFlow')}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/tokens?mint=${encodeURIComponent(tkn.address)}`
                          );
                        }}
                        className="border border-outline-variant/30 p-2 text-outline transition-all hover:border-primary/50 hover:text-primary"
                        aria-label={t('whalesPage.viewTrace')}
                      >
                        <MaterialIcon name="visibility" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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

            {tokensLoading && sortedByNotional.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-on-surface/45">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
                <span className="font-headline text-xs">{t('dashboard.syncing')}</span>
              </div>
            ) : !leadToken ? (
              <p className="py-8 text-center text-sm text-on-surface-variant">
                {t('whalesPage.profileEmpty')}
              </p>
            ) : (
              <>
                <div className="mb-8">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/tokens?mint=${encodeURIComponent(leadToken.address)}`
                      )
                    }
                    className="flex w-full items-center gap-4 rounded-sm text-left transition-colors hover:bg-surface-container-high/60"
                  >
                    <div className="relative shrink-0">
                      <div className="flex h-16 w-16 items-center justify-center rounded border-2 border-primary/20 bg-surface-container-low">
                        <span className="font-headline text-lg font-bold text-primary">
                          {leadToken.symbol.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      {leadToken.risk_score === 'A' ||
                      leadToken.risk_score === 'B' ? (
                        <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-secondary-container">
                          <MaterialIcon
                            name="verified"
                            className="text-[12px] text-on-secondary"
                            filled
                          />
                        </span>
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-label text-[9px] uppercase tracking-widest text-primary">
                        {t('whalesPage.profileLeadLabel')}
                      </p>
                      <h4 className="font-headline truncate text-lg font-bold tracking-tight text-on-surface">
                        {leadToken.symbol}
                        <span className="ml-1 font-normal text-on-surface/50">
                          · {leadToken.name}
                        </span>
                      </h4>
                    </div>
                  </button>
                  {leadWhaleWallet ? (
                    <a
                      href={TokenService.getSolscanAccountUrl(leadWhaleWallet)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block min-w-0 truncate pl-20 font-mono text-[11px] tracking-wider text-outline transition-colors hover:text-primary"
                      aria-label={t('whalesPage.openWhaleWalletExplorer')}
                    >
                      {shortenAddress(leadWhaleWallet, 5)}
                    </a>
                  ) : !rpcHoldersReady ? (
                    <span className="mt-1 block min-w-0 truncate pl-20 font-mono text-[11px] tracking-wider text-on-surface/35">
                      {t('whalesPage.walletPending')}
                    </span>
                  ) : (
                    <span className="mt-1 block min-w-0 truncate pl-20 font-mono text-[11px] tracking-wider text-on-surface/35">
                      {t('whalesPage.holderRpcEmpty')}
                    </span>
                  )}
                </div>

                <div className="mb-8 space-y-4">
                  <div>
                    <div className="mb-1.5 flex justify-between font-label text-[10px] uppercase tracking-widest text-outline">
                      <span>{t('whalesPage.topHoldings')}</span>
                      <span>{t('whalesPage.allocation')}</span>
                    </div>
                    <div className="space-y-2">
                      {topHoldingsRows.map(({ token: tok, pct }) => (
                        <div
                          key={tok.address}
                          className="flex items-center justify-between"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-container text-[10px] font-bold text-on-surface">
                              {tok.symbol.slice(0, 1).toUpperCase()}
                            </div>
                            <span className="truncate font-label text-xs text-on-surface">
                              {tok.symbol}
                            </span>
                          </div>
                          <span className="shrink-0 font-label text-xs tabular-nums text-on-surface">
                            {pct.toFixed(1)}%
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
                      {formatUsdCompact(totalTrackedLiquidity)}
                    </div>
                    <p className="mt-1 font-label text-[9px] text-on-surface/45">
                      {t('whalesPage.totalValueHint')}
                    </p>
                  </div>
                  <div className="rounded-sm border border-outline-variant/10 bg-surface-container-high p-3">
                    <div className="mb-1 font-label text-[9px] uppercase tracking-widest text-outline">
                      {t('whalesPage.samplePositive24h')}
                    </div>
                    <div className="font-headline text-sm font-bold text-secondary">
                      {samplePositive24hPct != null
                        ? `${samplePositive24hPct}%`
                        : '—'}
                    </div>
                    <p className="mt-1 font-label text-[9px] text-on-surface/45">
                      {t('whalesPage.samplePositive24hHint')}
                    </p>
                  </div>
                </div>
              </>
            )}
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
              <p className="font-label text-[9px] uppercase tracking-widest text-on-surface/40">
                {t('whalesPage.marketFlowSampleHint')}
              </p>
              <div>
                <div className="mb-2 flex items-end justify-between gap-2">
                  <div className="font-label text-[10px] uppercase text-on-surface">
                    {t('whalesPage.globalInflow')}
                  </div>
                  <div className="font-headline text-lg font-bold text-secondary">
                    {sortedByNotional.length === 0
                      ? '—'
                      : `+${formatUsdCompact(flow24h.volUp)}`}
                  </div>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container-highest">
                  <div
                    className="h-full bg-secondary transition-[width] duration-500"
                    style={{ width: `${flow24h.upBarPct}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-end justify-between gap-2">
                  <div className="font-label text-[10px] uppercase text-on-surface">
                    {t('whalesPage.globalOutflow')}
                  </div>
                  <div className="font-headline text-lg font-bold text-error">
                    {sortedByNotional.length === 0
                      ? '—'
                      : `−${formatUsdCompact(flow24h.volDown)}`}
                  </div>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container-highest">
                  <div
                    className="h-full bg-error transition-[width] duration-500"
                    style={{ width: `${flow24h.downBarPct}%` }}
                  />
                </div>
              </div>
              <div className="border-t border-outline-variant/10 pt-4">
                <div className="flex items-center gap-2 font-label text-[11px] uppercase tracking-wider text-outline">
                  <MaterialIcon name="info" className="text-xs text-primary" />
                  <span>
                    {flowSentimentKey ? t(flowSentimentKey) : t('whalesPage.sentiment')}
                  </span>
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
