/**
 * 代币详情 — SENTINEL 主题
 */

import { ExternalLink, Repeat, BarChart3, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TokenService } from '../services/api';
import type { Token } from '../types/token';
import { shortenAddress } from '../lib/format';
import { intlLocaleFor } from '../lib/intlLocale';

interface TokenDetailsProps {
  token: Token | null;
}

export function TokenDetails({ token }: TokenDetailsProps) {
  const { t, i18n } = useTranslation();
  const locale = intlLocaleFor(i18n.language);

  if (!token) {
    return (
      <div className="rounded border border-outline-variant/10 bg-surface-container-low/80 p-8 text-center text-on-surface/50">
        <div className="flex flex-col items-center gap-4">
          <Search className="h-12 w-12 text-primary/50" />
          <p className="font-headline text-sm">{t('tokenDetails.empty')}</p>
        </div>
      </div>
    );
  }

  const getRiskColor = (score: string) => {
    const colors = {
      A: 'text-secondary',
      B: 'text-primary',
      C: 'text-tertiary-container',
      D: 'text-error',
    };
    return colors[score as keyof typeof colors] || 'text-on-surface-variant';
  };

  const fmtUsd = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="rounded border border-outline-variant/10 bg-surface-container-low p-6">
      <h2 className="mb-6 font-headline text-xl font-bold text-on-surface">
        {t('tokenDetails.title')}
      </h2>

      <div className="mb-6">
        <h3 className="mb-3 font-headline text-2xl font-bold text-primary">
          {token.symbol}{' '}
          <span className="text-on-surface/60">· {token.name}</span>
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-on-surface/50">{t('tokenDetails.price')}</p>
            <p className="text-lg font-semibold text-on-surface">
              {token.price > 0 ? `$${token.price.toFixed(6)}` : t('tokenDetails.na')}
            </p>
          </div>
          <div>
            <p className="text-on-surface/50">{t('tokenDetails.h24')}</p>
            <p
              className={`text-lg font-semibold ${
                token.change_24h >= 0 ? 'text-secondary' : 'text-error'
              }`}
            >
              {token.change_24h >= 0 ? '+' : ''}
              {token.change_24h.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-on-surface/50">{t('tokenDetails.liquidity')}</p>
            <p className="text-lg font-semibold text-on-surface">
              {fmtUsd(token.liquidity)}
            </p>
          </div>
          <div>
            <p className="text-on-surface/50">{t('tokenDetails.vol24h')}</p>
            <p className="text-lg font-semibold text-on-surface">
              {fmtUsd(token.volume_24h)}
            </p>
          </div>
          <div>
            <p className="text-on-surface/50">{t('tokenDetails.dex')}</p>
            <p className="text-lg font-semibold text-on-surface">{token.dex}</p>
          </div>
          <div>
            <p className="text-on-surface/50">{t('tokenDetails.riskBand')}</p>
            <p className={`text-lg font-semibold ${getRiskColor(token.risk_score)}`}>
              {token.risk_score}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-headline text-lg font-semibold text-on-surface">
          {t('tokenDetails.quickLinks')}
        </h3>

        <a
          href={TokenService.getJupiterSwapUrl(token.address)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border border-secondary/20 bg-secondary/10 p-3 text-secondary transition-colors hover:bg-secondary/20"
        >
          <Repeat className="h-5 w-5" />
          <span className="flex-1 font-headline text-sm font-medium">
            {t('tokenDetails.jupiter')}
          </span>
          <ExternalLink className="h-4 w-4" />
        </a>

        {token.url && (
          <a
            href={token.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 p-3 text-primary transition-colors hover:bg-primary/20"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="flex-1 font-headline text-sm font-medium">
              {t('tokenDetails.dexscreener')}
            </span>
            <ExternalLink className="h-4 w-4" />
          </a>
        )}

        <a
          href={TokenService.getSolscanUrl(token.address)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border border-primary-container/30 bg-primary-container/10 p-3 text-primary-container transition-colors hover:bg-primary-container/20"
        >
          <Search className="h-5 w-5" />
          <span className="flex-1 font-headline text-sm font-medium">
            {t('tokenDetails.solscan')}
          </span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-6 rounded-lg border border-outline-variant/10 bg-surface-container-lowest p-3">
        <p className="mb-1 text-xs text-on-surface/50">{t('tokenDetails.mint')}</p>
        <p className="break-all font-mono text-sm text-on-surface-variant">
          {token.address}
        </p>
        <p className="mt-2 text-[10px] text-on-surface/40">
          {t('tokenDetails.short', { addr: shortenAddress(token.address, 6) })}
        </p>
      </div>
    </div>
  );
}
