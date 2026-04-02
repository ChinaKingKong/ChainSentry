import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { CommandSelect } from '../components/ui/CommandSelect';
import { TokenFocusSelect } from '../components/ui/TokenFocusSelect';
import { TokenLogo } from '../components/ui/TokenLogo';
import { MaterialIcon } from '../components/ui/MaterialIcon';
import { useClipboardCopy } from '../hooks/useClipboardCopy';
import {
  useJupiterSwapQuote,
  type JupiterSwapDirection,
} from '../hooks/useJupiterSwapQuote';
import { usePairActivity } from '../hooks/usePairActivity';
import { useTokens } from '../hooks/useTokens';
import {
  buildJupiterSwapUrl,
  formatRawAsDecimal,
  type JupiterPayAssetKey,
} from '../services/jupiterQuote';
import { getSolanaConnection } from '../services/solanaRpc';
import { useSolanaWallet } from '../wallet/useSolanaWallet';
import { formatTokenPrice, formatUsdCompact, shortenAddress } from '../lib/format';
import { intlLocaleFor } from '../lib/intlLocale';
import {
  riskToSentryScore,
  sentryScoreBarColor,
  sentryScoreTextColor,
} from '../lib/sentryScore';
import {
  computeSecurityScore,
  fetchMintAuditOnChain,
  type MintAuditOnChain,
} from '../services/mintAudit';
import {
  buildSyntheticCandles,
  type SyntheticCandle,
} from '../lib/tokenPairChart';
import { TokenService } from '../services/api';
import { passesFocusDashboardTokenRules } from '../lib/tokenListFilters';
import type { Token } from '../types/token';

function TokenChartCandleColumn({
  candle,
  globalMin,
  globalMax,
}: {
  candle: SyntheticCandle;
  globalMin: number;
  globalMax: number;
}) {
  const span = globalMax - globalMin || 1;
  const lowPct = (candle.low - globalMin) / span;
  const highPct = (candle.high - globalMin) / span;
  const bodyLow = (Math.min(candle.open, candle.close) - globalMin) / span;
  const bodyHigh = (Math.max(candle.open, candle.close) - globalMin) / span;
  const wickH = Math.max((highPct - lowPct) * 100, 0.35);
  const bodyH = Math.max((bodyHigh - bodyLow) * 100, 0.45);

  return (
    <div className="relative h-full min-w-0 flex-1 max-w-[12px]">
      <div className="absolute inset-x-0 bottom-0 top-0 mx-auto w-full max-w-[8px]">
        <div
          className={`absolute left-1/2 w-px -translate-x-1/2 ${
            candle.bull ? 'bg-secondary' : 'bg-error'
          }`}
          style={{
            bottom: `${lowPct * 100}%`,
            height: `${wickH}%`,
          }}
        />
        <div
          className={`absolute left-1/2 w-[65%] max-w-[6px] min-w-[2px] -translate-x-1/2 ${
            candle.bull ? 'bg-secondary' : 'bg-error/90'
          }`}
          style={{
            bottom: `${bodyLow * 100}%`,
            height: `${bodyH}%`,
            opacity: candle.bull ? 0.88 : 0.78,
          }}
        />
      </div>
    </div>
  );
}

/** 兑换区大数字：按字符长度缩小字号，避免与右侧代币选择器重叠 */
function swapAmountFontClass(display: string): string {
  const len = display.trim().length;
  if (len === 0) return 'text-2xl';
  if (len > 20) return 'text-sm leading-snug';
  if (len > 15) return 'text-base leading-snug';
  if (len > 12) return 'text-lg leading-snug';
  return 'text-2xl';
}

export function TokensPage() {
  const { t, i18n } = useTranslation();
  const locale = intlLocaleFor(i18n.language);
  const [params, setParams] = useSearchParams();
  const mint = params.get('mint');
  const [tf, setTf] = useState<'1m' | '5m' | '1h' | '1d'>('1m');
  const [payAmount, setPayAmount] = useState('1');
  const [payAsset, setPayAsset] = useState<JupiterPayAssetKey>('SOL');
  const [swapDir, setSwapDir] = useState<JupiterSwapDirection>('buy');
  const { publicKey } = useSolanaWallet();
  const [solBalanceSol, setSolBalanceSol] = useState<number | null>(null);
  /** 多取一些再在「关注交易对」侧按指挥台同款规则过滤，避免筛完后选项过少 */
  const { tokens, loading } = useTokens(400, false, 0);

  useEffect(() => {
    document.title = t('tokensPage.docTitle');
    return () => {
      document.title = i18n.t('meta.defaultTitle');
    };
  }, [t, i18n]);

  /** 与指挥台一致：≥10 万 U、有 Dex 图标、排除稳定币（关注列表顺序） */
  const tokensForSelect = useMemo(() => {
    if (tokens.length === 0) return [];
    return tokens
      .filter(passesFocusDashboardTokenRules)
      .sort((a, b) => b.liquidity - a.liquidity);
  }, [tokens]);

  const token: Token | null = useMemo(() => {
    if (tokens.length === 0) return null;
    if (mint) {
      const hit = tokens.find((x) => x.address === mint);
      if (hit) return hit;
    }
    /** 直进 /tokens：与下拉第一项一致；无合格项时退回原始 feed 首条 */
    return tokensForSelect[0] ?? tokens[0] ?? null;
  }, [mint, tokens, tokensForSelect]);

  /** 无 query 时把默认代币写入 URL，避免刷新丢上下文且与列表第一项一致 */
  useEffect(() => {
    if (mint) return;
    if (loading) return;
    const first = tokensForSelect[0] ?? tokens[0];
    if (!first?.address) return;
    setParams({ mint: first.address }, { replace: true });
  }, [loading, mint, setParams, tokens, tokensForSelect]);

  const jupiterQuote = useJupiterSwapQuote(
    token?.address,
    payAmount,
    payAsset,
    50,
    swapDir
  );

  useEffect(() => {
    if (!publicKey) {
      setSolBalanceSol(null);
      return;
    }
    let cancelled = false;
    void getSolanaConnection()
      .getBalance(publicKey)
      .then((lamports) => {
        if (!cancelled) setSolBalanceSol(lamports / 1e9);
      })
      .catch(() => {
        if (!cancelled) setSolBalanceSol(null);
      });
    return () => {
      cancelled = true;
    };
  }, [publicKey]);

  const mcapApprox = token
    ? Math.max(token.liquidity * 2.2, token.volume_24h * 0.15)
    : 0;
  const fdvApprox = mcapApprox * 2.35;

  const copyToClipboard = useClipboardCopy();

  const { rows: poolSigs, loading: poolSigLoading } = usePairActivity(
    token?.pair_address,
    14
  );

  const [mintAudit, setMintAudit] = useState<MintAuditOnChain | null>(null);
  const [mintAuditLoading, setMintAuditLoading] = useState(false);

  useEffect(() => {
    const addr = token?.address;
    if (!addr) {
      setMintAudit(null);
      setMintAuditLoading(false);
      return;
    }
    let cancelled = false;
    setMintAuditLoading(true);
    void fetchMintAuditOnChain(addr).then((a) => {
      if (!cancelled) {
        setMintAudit(a);
        setMintAuditLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [token?.address]);

  const score = useMemo(() => {
    if (!token) return 0;
    if (mintAudit) return computeSecurityScore(mintAudit, token.liquidity);
    return riskToSentryScore(token.risk_score);
  }, [token, mintAudit]);

  const holderBarPct = useMemo(() => {
    if (!token) return 0;
    if (mintAudit) return Math.min(100, mintAudit.top10HolderPct);
    return Math.min(35, 8 + (100 - riskToSentryScore(token.risk_score)) * 0.25);
  }, [token, mintAudit]);

  const { chartCandles, chartBounds } = useMemo(() => {
    const empty = {
      chartCandles: [] as SyntheticCandle[],
      chartBounds: { min: 0, max: 1 },
    };
    if (
      !token?.address ||
      !Number.isFinite(token.price) ||
      token.price <= 0
    ) {
      return empty;
    }
    const candles = buildSyntheticCandles(tf, token.address, token.price);
    if (candles.length === 0) return empty;
    let min = Infinity;
    let max = -Infinity;
    for (const c of candles) {
      min = Math.min(min, c.low);
      max = Math.max(max, c.high);
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) return empty;
    if (min === max) {
      const eps = Math.abs(min) * 1e-6 || 1e-9;
      return { chartCandles: candles, chartBounds: { min: min - eps, max: max + eps } };
    }
    return { chartCandles: candles, chartBounds: { min, max } };
  }, [token, tf]);

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

  const swapExecuteHref = buildJupiterSwapUrl(
    jupiterQuote.inputMint,
    jupiterQuote.outputMint,
    jupiterQuote.rawInAmount > 0n ? jupiterQuote.rawInAmount : undefined
  );

  const stableBalanceRight =
    publicKey && payAsset === 'SOL' && solBalanceSol != null
      ? `${solBalanceSol.toLocaleString(locale, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })} SOL`
      : publicKey && payAsset === 'USDC'
        ? t('tokensPage.balanceUsdcHint')
        : t('tokensPage.balanceUnknown');

  const payBalanceRight =
    swapDir === 'sell' ? t('tokensPage.balanceUnknown') : stableBalanceRight;

  const receiveBalanceRight =
    swapDir === 'buy' ? t('tokensPage.balanceUnknown') : stableBalanceRight;

  const receiveAmountDisplay = jupiterQuote.loading
    ? t('tokensPage.swapQuoteLoading')
    : jupiterQuote.quote
      ? formatRawAsDecimal(
          jupiterQuote.quote.outAmount,
          jupiterQuote.receiveDecimals,
          locale,
          { fractionDigits: 2 }
        )
      : t('tokensPage.balanceUnknown');

  const receiveAmountClass = swapAmountFontClass(receiveAmountDisplay);

  const lastChartCandle =
    chartCandles.length > 0 ? chartCandles[chartCandles.length - 1] : null;
  const fmtOhlc = (v: number) =>
    v.toLocaleString(locale, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  const closeStr =
    lastChartCandle != null
      ? fmtOhlc(lastChartCandle.close)
      : token.price > 0
        ? fmtOhlc(token.price)
        : t('hero.dash');

  return (
    <div id="tokens-page-top" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-20 scanline-bg"
        aria-hidden
      />

      <header className="relative z-30 mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <TokenLogo
            logoUri={token.logo_uri}
            symbol={token.symbol}
            className="h-16 w-16 shrink-0"
            fallbackFrameClassName="border-2 border-primary/20 bg-surface-container-highest"
            fallbackClassName="text-2xl font-black text-primary"
          />
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
                onClick={() => void copyToClipboard(token.address)}
                className="text-on-surface-variant flex items-center gap-1 transition-colors hover:text-primary"
              >
                <MaterialIcon name="content_copy" className="text-sm" />
                {t('tokensPage.caLabel')} {shortenAddress(token.address, 4)}
              </button>
              <a
                href={TokenService.getDexScreenerChartUrl(token)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-on-surface-variant flex items-center gap-1 no-underline transition-colors hover:text-primary"
                aria-label={t('tokensPage.openDexScreenerChart')}
              >
                <MaterialIcon name="schedule" className="text-sm" aria-hidden />
                {t('tokensPage.pairAge')}
              </a>
              <span
                className="text-on-surface-variant/35 select-none"
                aria-hidden
              >
                ·
              </span>
              <a
                href={TokenService.getOkxSolanaTokenUrl(
                  token.address,
                  i18n.language
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-on-surface-variant flex items-center gap-1 no-underline transition-colors hover:text-primary"
                aria-label={t('tokensPage.openOkxChart')}
              >
                <MaterialIcon name="candlestick_chart" className="text-sm" />
                {t('tokensPage.okxChartLink')}
              </a>
              <span className="flex items-center gap-1 text-secondary">
                <span className="h-2 w-2 rounded-full bg-secondary" />
                {t('tokensPage.liveFeed')}
              </span>
            </div>
            <label className="mt-4 flex flex-col gap-2 text-xs text-on-surface/70 sm:flex-row sm:items-center sm:gap-2.5">
              <span className="shrink-0 font-headline uppercase tracking-wider">
                {t('tokensPage.focusPair')}
              </span>
              <TokenFocusSelect
                className="w-max max-w-[11rem] shrink-0 sm:max-w-[12rem]"
                aria-label={t('tokensPage.focusPair')}
                value={token.address}
                tokens={tokensForSelect}
                fallbackToken={token}
                onChange={(mintAddress) => {
                  setParams(mintAddress ? { mint: mintAddress } : {});
                }}
              />
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
                  {lastChartCandle
                    ? fmtOhlc(lastChartCandle.open)
                    : fmtOhlc(token.price * 0.98)}
                </span>
                <span className="text-error">
                  {t('tokensPage.ohlcH')}{' '}
                  {lastChartCandle
                    ? fmtOhlc(lastChartCandle.high)
                    : fmtOhlc(token.price * 1.02)}
                </span>
                <span className="text-secondary">
                  {t('tokensPage.ohlcL')}{' '}
                  {lastChartCandle
                    ? fmtOhlc(lastChartCandle.low)
                    : fmtOhlc(token.price * 0.97)}
                </span>
                <span className="text-on-surface">
                  {t('tokensPage.ohlcC')} {closeStr}
                </span>
              </div>
            </div>
            <div className="relative h-[320px] w-full bg-surface-container-lowest p-4 sm:h-[400px]">
              {chartCandles.length === 0 ? (
                <div className="flex h-full items-center justify-center font-label text-xs text-on-surface-variant">
                  {t('tokensPage.chartNoPrice')}
                </div>
              ) : (
                <>
                  <div className="absolute inset-4 bottom-14 flex flex-row items-stretch justify-between gap-px opacity-90 sm:inset-6 sm:bottom-16">
                    {chartCandles.map((c, i) => (
                      <TokenChartCandleColumn
                        key={`${tf}-${token.address}-${i}`}
                        candle={c}
                        globalMin={chartBounds.min}
                        globalMax={chartBounds.max}
                      />
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
                </>
              )}
            </div>
          </section>

          <section className="border border-outline-variant/10 bg-surface-container">
            <div className="flex flex-col gap-3 border-b border-outline-variant/5 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-headline text-sm font-bold uppercase tracking-widest">
                {t('tokensPage.poolActivity')}
              </h3>
              {poolSigLoading ? (
                <span className="font-label text-[10px] text-on-surface-variant">
                  {t('tokensPage.poolActivityLoading')}
                </span>
              ) : null}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-label text-xs">
                <thead className="bg-surface-container-low text-on-surface-variant">
                  <tr>
                    <th className="px-6 py-3 font-medium uppercase tracking-tighter">
                      {t('tokensPage.time')}
                    </th>
                    <th className="px-6 py-3 font-medium uppercase tracking-tighter">
                      {t('tokensPage.colSignature')}
                    </th>
                    <th className="px-6 py-3 font-medium uppercase tracking-tighter">
                      {t('tokensPage.colSlot')}
                    </th>
                    <th className="px-6 py-3 text-right font-medium uppercase tracking-tighter">
                      {t('tokensPage.txn')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {poolSigs.length === 0 && !poolSigLoading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-on-surface-variant"
                      >
                        {t('tokensPage.poolActivityEmpty')}
                      </td>
                    </tr>
                  ) : (
                    poolSigs.map((row) => {
                      const timeStr =
                        row.blockTime != null
                          ? new Date(row.blockTime * 1000).toLocaleString(
                              locale
                            )
                          : '—';
                      const short = `${row.signature.slice(0, 8)}…${row.signature.slice(-6)}`;
                      const href = `https://solscan.io/tx/${row.signature}`;
                      return (
                        <tr
                          key={row.signature}
                          className="transition-colors hover:bg-surface-container-high"
                        >
                          <td className="px-6 py-4 text-on-surface-variant">
                            {timeStr}
                          </td>
                          <td className="max-w-[180px] px-6 py-4 font-mono text-[11px] text-on-surface">
                            <span className="inline-flex max-w-full items-center gap-2 truncate">
                              <span className="truncate">{short}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  void copyToClipboard(row.signature)
                                }
                                className="shrink-0 text-on-surface-variant transition-colors hover:text-primary"
                                aria-label={t('tokensPage.copySignature')}
                              >
                                <MaterialIcon
                                  name="content_copy"
                                  className="text-sm"
                                />
                              </button>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-on-surface-variant">
                            {row.slot ?? '—'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <a
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                              aria-label={t('tokensPage.linkSolscanTx')}
                            >
                              <MaterialIcon
                                name="open_in_new"
                                className="text-sm"
                              />
                            </a>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <p className="border-t border-outline-variant/5 px-6 py-2 text-[10px] text-on-surface-variant/70">
              {t('tokensPage.poolActivityDisclaimer')}
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
                  <span className="max-w-[55%] truncate text-right">
                    {t('tokensPage.balanceLabel')}{' '}
                    <span className="text-on-surface/80">{payBalanceRight}</span>
                  </span>
                </div>
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    aria-label={
                      swapDir === 'buy'
                        ? t('tokensPage.youPay')
                        : t('tokensPage.payTokenAmount', {
                            symbol: token.symbol,
                          })
                    }
                    className={`min-w-0 flex-1 border-0 bg-transparent font-headline font-bold text-on-surface outline-none ring-0 placeholder:text-outline/30 ${swapAmountFontClass(payAmount)}`}
                    placeholder="0"
                  />
                  {swapDir === 'buy' ? (
                    <>
                      <label className="sr-only" htmlFor="swap-pay-asset">
                        {t('tokensPage.swapPayAsset')}
                      </label>
                      <CommandSelect
                        id="swap-pay-asset"
                        size="md"
                        className="shrink-0"
                        aria-label={t('tokensPage.swapPayAsset')}
                        value={payAsset}
                        onChange={(e) =>
                          setPayAsset(e.target.value as JupiterPayAssetKey)
                        }
                      >
                        <option value="SOL">SOL</option>
                        <option value="USDC">USDC</option>
                      </CommandSelect>
                    </>
                  ) : (
                    <div className="flex shrink-0 items-center rounded-md border border-primary/20 bg-surface-container-low px-3 py-1.5 font-headline text-sm font-bold text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      {token.symbol}
                    </div>
                  )}
                </div>
              </div>
              <div className="relative z-10 -my-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setSwapDir((d) => (d === 'buy' ? 'sell' : 'buy'));
                    setPayAmount('1');
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/15 bg-surface-container text-primary transition-colors hover:border-primary/35 hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary-container/25"
                  aria-label={t('tokensPage.swapFlipDirection')}
                >
                  <MaterialIcon name="swap_vert" className="text-sm" aria-hidden />
                </button>
              </div>
              <div className="border border-outline-variant/5 bg-surface-container-lowest p-4">
                <div className="mb-2 flex justify-between font-label text-[10px] text-on-surface-variant">
                  <span>{t('tokensPage.youReceive')}</span>
                  <span className="max-w-[55%] truncate text-right">
                    {t('tokensPage.balanceLabel')}{' '}
                    <span className="text-on-surface/80">
                      {receiveBalanceRight}
                    </span>
                  </span>
                </div>
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <span
                    className={`font-headline min-w-0 flex-1 font-bold tabular-nums ${receiveAmountClass} ${jupiterQuote.quote ? 'text-primary' : 'text-on-surface-variant'}`}
                  >
                    {receiveAmountDisplay}
                  </span>
                  {swapDir === 'buy' ? (
                    <div className="flex shrink-0 items-center rounded-md border border-primary/20 bg-surface-container-low px-3 py-1.5 font-headline text-sm font-bold text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                      {token.symbol}
                    </div>
                  ) : (
                    <>
                      <label className="sr-only" htmlFor="swap-receive-asset">
                        {t('tokensPage.swapReceiveAsset')}
                      </label>
                      <CommandSelect
                        id="swap-receive-asset"
                        size="md"
                        className="shrink-0"
                        aria-label={t('tokensPage.swapReceiveAsset')}
                        value={payAsset}
                        onChange={(e) =>
                          setPayAsset(e.target.value as JupiterPayAssetKey)
                        }
                      >
                        <option value="SOL">SOL</option>
                        <option value="USDC">USDC</option>
                      </CommandSelect>
                    </>
                  )}
                </div>
                {jupiterQuote.error === 'invalid_amount' ? (
                  <p className="mt-2 font-label text-[10px] text-error">
                    {t('tokensPage.swapInvalidAmount')}
                  </p>
                ) : null}
                {jupiterQuote.error === 'no_route' && !jupiterQuote.loading ? (
                  <p className="mt-2 font-label text-[10px] text-error">
                    {t('tokensPage.swapNoRoute')}
                  </p>
                ) : null}
              </div>
              <div className="pt-2">
                <div className="mb-2 flex flex-wrap justify-between gap-x-4 gap-y-1 px-1 font-label text-[10px]">
                  <span className="text-on-surface-variant">
                    {t('tokensPage.routeJupiter')}
                  </span>
                  <span className="text-secondary">{t('tokensPage.slippage')}</span>
                </div>
                {jupiterQuote.quote && !jupiterQuote.loading ? (
                  <p className="mb-3 px-1 font-label text-[10px] text-on-surface-variant">
                    {t('tokensPage.swapPriceImpact', {
                      p: Number(jupiterQuote.quote.priceImpactPct).toLocaleString(
                        locale,
                        { maximumFractionDigits: 2 }
                      ),
                    })}
                  </p>
                ) : null}
                <a
                  href={swapExecuteHref}
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
                  <div className="text-xs font-bold uppercase">
                    {mintAuditLoading ? (
                      <span className="animate-pulse text-on-surface-variant">
                        {t('tokensPage.auditFetching')}
                      </span>
                    ) : !mintAudit ? (
                      <span className="text-on-surface-variant">
                        {t('tokensPage.unknown')}
                      </span>
                    ) : mintAudit.mintAuthorityDisabled ? (
                      <span className="text-secondary">
                        {t('tokensPage.authAuthorityClosed')}
                      </span>
                    ) : (
                      <span
                        className="font-mono text-[10px] text-error/90"
                        title={mintAudit.mintAuthorityAddress ?? undefined}
                      >
                        {shortenAddress(mintAudit.mintAuthorityAddress!, 4)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between border-l-2 border-secondary bg-surface-container-lowest p-3">
                  <div className="font-label text-xs uppercase tracking-wider text-on-surface-variant">
                    {t('tokensPage.freezeAuth')}
                  </div>
                  <div className="text-xs font-bold uppercase">
                    {mintAuditLoading ? (
                      <span className="animate-pulse text-on-surface-variant">
                        {t('tokensPage.auditFetching')}
                      </span>
                    ) : !mintAudit ? (
                      <span className="text-on-surface-variant">
                        {t('tokensPage.unknown')}
                      </span>
                    ) : mintAudit.freezeAuthorityRemoved ? (
                      <span className="text-secondary">
                        {t('tokensPage.authAuthorityClosed')}
                      </span>
                    ) : (
                      <span
                        className="font-mono text-[10px] text-error/90"
                        title={mintAudit.freezeAuthorityAddress ?? undefined}
                      >
                        {shortenAddress(mintAudit.freezeAuthorityAddress!, 4)}
                      </span>
                    )}
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
                  <div
                    className={`font-headline text-xl font-bold ${sentryScoreTextColor(score)}`}
                  >
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
                  {mintAudit
                    ? t('tokensPage.auditHintOnChain')
                    : t('tokensPage.auditHint')}
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
