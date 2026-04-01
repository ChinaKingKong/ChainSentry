import { useTranslation } from 'react-i18next';

const cells = [
  'bg-secondary/40',
  'bg-secondary/60',
  'bg-secondary/20',
  'bg-secondary/80',
  'bg-secondary/40',
  'bg-tertiary-container/30',
  'bg-secondary/50',
  'bg-secondary/10',
  'bg-error/20',
  'bg-secondary/40',
  'bg-secondary/90',
  'bg-secondary/40',
  'bg-secondary/20',
  'bg-error/40',
  'bg-secondary/60',
  'bg-secondary/40',
];

export function SentimentHeatmap() {
  const { t } = useTranslation();

  return (
    <div className="rounded bg-surface-container p-6">
      <h4 className="mb-6 text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface/50">
        {t('sentiment.title')}
      </h4>
      <div className="relative grid h-48 grid-cols-4 grid-rows-4 gap-1 overflow-hidden rounded bg-surface-container-lowest p-1">
        {cells.map((c, i) => (
          <div key={i} className={`rounded-sm ${c}`} />
        ))}
      </div>
      <div className="mt-4 flex justify-between text-[10px] font-bold uppercase tracking-widest">
        <span className="text-error">{t('sentiment.fear')}</span>
        <span className="text-on-surface/40">{t('sentiment.neutral')}</span>
        <span className="text-secondary">{t('sentiment.greed')}</span>
      </div>
    </div>
  );
}
