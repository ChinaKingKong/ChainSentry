import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Token } from '../../types/token';

function heatClass(change: number): string {
  if (change <= -10) return 'bg-error/75';
  if (change <= -5) return 'bg-error/50';
  if (change <= -1.5) return 'bg-error/25';
  if (change < 1.5) return 'bg-tertiary-container/35';
  if (change < 5) return 'bg-secondary/45';
  if (change < 10) return 'bg-secondary/65';
  return 'bg-secondary/90';
}

const NEUTRAL_CELL = 'bg-surface-container-high/40';

export interface SentimentHeatmapProps {
  tokens: Token[];
  loading?: boolean;
}

export function SentimentHeatmap({ tokens, loading }: SentimentHeatmapProps) {
  const { t } = useTranslation();

  const cells = useMemo(() => {
    const slice = tokens.slice(0, 16);
    const out = slice.map((tok) => heatClass(tok.change_24h));
    while (out.length < 16) out.push(NEUTRAL_CELL);
    return out;
  }, [tokens]);

  return (
    <div className="rounded bg-surface-container p-6">
      <h4 className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface/50">
        {t('sentiment.title')}
      </h4>
      <div className="relative grid h-48 grid-cols-4 grid-rows-4 gap-1 overflow-hidden rounded bg-surface-container-lowest p-1">
        {loading && tokens.length === 0 ? (
          <div className="col-span-4 row-span-4 flex items-center justify-center gap-2 text-on-surface/45">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
            <span className="font-headline text-xs">{t('dashboard.syncing')}</span>
          </div>
        ) : (
          cells.map((c, i) => (
            <div key={i} className={`rounded-sm transition-colors duration-300 ${c}`} />
          ))
        )}
      </div>
      <div className="mt-4 flex justify-between text-[10px] font-bold uppercase tracking-widest">
        <span className="text-error">{t('sentiment.fear')}</span>
        <span className="text-on-surface/40">{t('sentiment.neutral')}</span>
        <span className="text-secondary">{t('sentiment.greed')}</span>
      </div>
    </div>
  );
}
