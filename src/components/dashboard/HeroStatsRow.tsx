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

/** Win2k group-box stat card */
function StatCard({
  title,
  children,
  accentColor,
}: {
  title: string;
  children: React.ReactNode;
  accentColor?: string;
}) {
  return (
    <div
      style={{
        backgroundColor: '#D4D0C8',
        border: '2px solid #FFFFFF',
        borderRightColor: '#808080',
        borderBottomColor: '#808080',
        padding: '0',
      }}
    >
      {/* Card title bar */}
      <div
        className="win-titlebar"
        style={{
          background: accentColor
            ? `linear-gradient(to right, ${accentColor}, ${accentColor}aa)`
            : 'linear-gradient(to right, #000080, #1084D0)',
          fontSize: '11px',
          padding: '3px 8px',
        }}
      >
        {title}
      </div>
      <div style={{ padding: '10px 12px' }}>
        {children}
      </div>
    </div>
  );
}

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
    <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
      {/* Card 1: Network TPS */}
      <StatCard title={t('hero.networkTps')}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div
              className="font-bold"
              style={{ fontSize: '28px', lineHeight: 1.1, color: '#000080', fontFamily: 'Tahoma, sans-serif' }}
            >
              {mainNumber}
            </div>
            <div className="text-[10px] mt-1" style={{ color: '#444444' }}>
              {t('hero.slotDerived')}
            </div>
          </div>
          {/* RPC live indicator — Win2k LED style */}
          <div
            className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold"
            style={{
              border: '1px solid #808080',
              borderRightColor: '#FFFFFF',
              borderBottomColor: '#FFFFFF',
              backgroundColor: '#C0C0C0',
              color: rpcLive ? '#008000' : '#CC0000',
            }}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: rpcLive ? '#00CC00' : '#CC0000' }}
              aria-hidden
            />
            {rpcLive ? t('hero.live') : t('hero.stale')}
          </div>
        </div>

        {/* Classic Win2k progress-bar style activity bars */}
        <div
          className="flex h-6 items-end gap-px overflow-hidden"
          style={{
            border: '2px solid #808080',
            borderRightColor: '#FFFFFF',
            borderBottomColor: '#FFFFFF',
            backgroundColor: '#FFFFFF',
            padding: '1px',
          }}
        >
          {[20, 40, 30, 60, 50, 80, 70, 100, 90, 75, 85, 65].map((pct, i) => (
            <div
              key={i}
              className="flex-1"
              style={{
                height: `${pct}%`,
                backgroundColor: '#000080',
              }}
            />
          ))}
        </div>
      </StatCard>

      {/* Card 2: Liquidity */}
      <StatCard title={t('hero.liquidityTracked')}>
        <div
          className="font-bold mb-2"
          style={{ fontSize: '28px', lineHeight: 1.1, color: '#000080', fontFamily: 'Tahoma, sans-serif' }}
        >
          {liquidityLabel}
        </div>
        <div
          className="flex items-center gap-1 text-[11px]"
          style={{ color: liquidityChangePct != null && liquidityChangePct >= 0 ? '#008000' : '#CC0000' }}
        >
          <MaterialIcon
            name={liquidityChangePct != null && liquidityChangePct >= 0 ? 'arrow_upward' : 'arrow_downward'}
          />
          <span className="font-bold">{changeLine}</span>
        </div>

        {/* Win2k inset progress bar */}
        <div
          className="mt-3 h-3"
          style={{
            border: '2px solid #808080',
            borderRightColor: '#FFFFFF',
            borderBottomColor: '#FFFFFF',
            backgroundColor: '#FFFFFF',
            padding: '1px',
          }}
        >
          <div
            className="h-full"
            style={{
              width: liquidityChangePct != null ? `${Math.min(Math.abs(liquidityChangePct) * 5, 100)}%` : '30%',
              backgroundColor: '#000080',
            }}
          />
        </div>
      </StatCard>

      {/* Card 3: High Risk — warning accent */}
      <StatCard title={t('hero.highRisk')} accentColor="#CC0000">
        <div className="flex items-start justify-between">
          <div>
            <div
              className="font-bold"
              style={{ fontSize: '28px', lineHeight: 1.1, color: '#CC0000', fontFamily: 'Tahoma, sans-serif' }}
            >
              {highRiskCount}
            </div>
            <p className="mt-2 text-[11px] italic" style={{ color: '#444444' }}>
              {t('hero.highRiskHint')}
            </p>
          </div>
          {/* Warning icon with Win2k dialog icon look */}
          <div
            className="flex h-10 w-10 items-center justify-center shrink-0"
            style={{
              backgroundColor: '#FFFF00',
              border: '2px solid #808080',
              borderRightColor: '#FFFFFF',
              borderBottomColor: '#FFFFFF',
            }}
          >
            <MaterialIcon name="warning" className="text-on-surface" style={{ color: '#000000', fontSize: '20px !important' }} />
          </div>
        </div>

        {/* Simulated Win2k alert bar */}
        <div
          className="mt-3 flex items-center gap-2 px-2 py-1 text-[10px]"
          style={{
            backgroundColor: '#FFF0C0',
            border: '1px solid #808080',
            color: '#664400',
          }}
        >
          <MaterialIcon name="info" />
          Tokens rated C or D grade
        </div>
      </StatCard>
    </div>
  );
}
