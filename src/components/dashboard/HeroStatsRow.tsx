import { useTranslation } from 'react-i18next';
import { intlLocaleFor } from '../../lib/intlLocale';
import { MaterialIcon } from '../ui/MaterialIcon';

export type HeroStatsRowProps = {
  activityIndex: number | null;
  liquidityLabel: string;
  liquidityChangePct: number | null;
  highRiskCount: number;
  rpcLive: boolean;
};

const pulseBars = [
  'h-[60%] bg-primary-container/20',
  'h-[40%] bg-primary-container/20',
  'h-[80%] bg-primary-container/40',
  'h-[50%] bg-primary-container/30',
  'h-[90%] bg-primary-container/60',
  'h-full bg-primary-container',
];

export function HeroStatsRow({
  activityIndex,
  liquidityLabel,
  liquidityChangePct,
  highRiskCount,
  rpcLive,
}: HeroStatsRowProps) {
  const { t, i18n } = useTranslation();
  const locale = intlLocaleFor(i18n.language);

  const mainNumber =
    activityIndex != null
      ? new Intl.NumberFormat(locale, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }).format(activityIndex)
      : t('hero.dash');

  const changeLine =
    liquidityChangePct != null
      ? t('hero.vs24hSample', {
          sign: liquidityChangePct >= 0 ? '+' : '',
          pct: liquidityChangePct.toFixed(1),
        })
      : t('hero.dash');

  return (
    <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div className="group relative overflow-hidden rounded bg-surface-container-low p-6">
        <div className="scanline" />
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="mb-1 font-label text-[10px] uppercase tracking-widest text-primary/70">
              {t('hero.networkTps')}
            </p>
            <h2 className="font-headline text-4xl font-bold text-on-surface">
              {mainNumber}
            </h2>
            <p className="mt-1 text-[10px] text-on-surface/40">
              {t('hero.slotDerived')}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-secondary/10 px-2 py-1">
            <span className="relative flex h-2 w-2">
              {rpcLive && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
              )}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${rpcLive ? 'bg-secondary' : 'bg-error'}`}
              />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-tighter text-secondary">
              {rpcLive ? t('hero.live') : t('hero.stale')}
            </span>
          </div>
        </div>
        <div className="flex h-12 items-end gap-1">
          {pulseBars.map((cls, i) => (
            <div key={i} className={`w-full rounded-t-sm ${cls}`} />
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded bg-surface-container-low p-6">
        {/* 左侧压暗保正文；右侧透明，否则渐变会把右下角钱币完全盖住 */}
        <div
          className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-surface-container-low from-[0%] via-surface-container-low/96 via-[48%] to-transparent"
          aria-hidden
        />
        {/* 小区域贴右下角，避免整卡 bg-contain 把钱币放得过大 */}
        <div
          className="pointer-events-none absolute bottom-0 right-0 z-[1] h-[5rem] w-[11.5rem] max-w-[52%] bg-no-repeat opacity-[0.38] sm:h-[5.75rem] sm:w-[13.5rem]"
          aria-hidden
        />
        <div className="relative z-10">
          <p className="mb-1 font-label text-[10px] uppercase tracking-widest text-primary/70">
            {t('hero.liquidityTracked')}
          </p>
          <h2 className="font-headline text-4xl font-bold text-on-surface">
            {liquidityLabel}
          </h2>
          <div className="mt-4 flex items-center gap-2">
            <MaterialIcon name="trending_up" className="text-sm text-secondary" />
            <span className="text-xs font-medium text-secondary">
              {changeLine}
            </span>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded border-l-2 border-tertiary-container bg-surface-container-low p-6">
        <p className="mb-1 font-label text-[10px] uppercase tracking-widest text-tertiary-container">
          {t('hero.highRisk')}
        </p>
        <h2 className="font-headline text-4xl font-bold text-on-surface">
          {highRiskCount}
        </h2>
        <p className="mt-4 text-xs italic text-on-surface/50">
          {t('hero.highRiskHint')}
        </p>
        <div className="absolute right-6 top-6">
          <MaterialIcon
            name="warning"
            className="animate-pulse text-tertiary-container"
          />
        </div>
      </div>
    </div>
  );
}
