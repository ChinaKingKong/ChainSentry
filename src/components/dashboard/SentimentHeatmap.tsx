import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Token } from '../../types/token';

/** Returns a Win2k-appropriate background color based on market change */
function heatColor(change: number): string {
  if (change <= -10) return '#CC0000';
  if (change <= -5)  return '#CC4400';
  if (change <= -1.5) return '#998800';
  if (change < 1.5)  return '#888888';
  if (change < 5)    return '#007700';
  if (change < 10)   return '#009900';
  return '#00AA00';
}

const NEUTRAL_COLOR = '#C0C0C0';

export interface SentimentHeatmapProps {
  tokens: Token[];
  loading?: boolean;
}

export function SentimentHeatmap({ tokens, loading }: SentimentHeatmapProps) {
  const { t } = useTranslation();

  const cells = useMemo(() => {
    const slice = tokens.slice(0, 16);
    const out = slice.map((tok) => ({
      color: heatColor(tok.change_24h),
      symbol: tok.symbol.slice(0, 3),
      change: tok.change_24h,
    }));
    while (out.length < 16) out.push({ color: NEUTRAL_COLOR, symbol: '—', change: 0 });
    return out;
  }, [tokens]);

  return (
    <div
      style={{
        border: '2px solid #FFFFFF',
        borderRightColor: '#808080',
        borderBottomColor: '#808080',
        backgroundColor: '#D4D0C8',
      }}
    >
      {/* Win2k title bar */}
      <div
        className="win-titlebar"
        style={{ fontSize: '11px', padding: '3px 8px' }}
      >
        {t('sentiment.title')}
      </div>

      {/* Grid body */}
      <div style={{ padding: '8px' }}>
        {loading && tokens.length === 0 ? (
          <div
            className="flex h-36 items-center justify-center gap-2 text-[11px]"
            style={{ backgroundColor: '#FFFFFF', border: '2px inset #808080', color: '#444444' }}
          >
            <div
              className="h-4 w-4 animate-spin rounded-full"
              style={{ border: '2px solid #808080', borderTopColor: '#000080' }}
            />
            <span>{t('dashboard.syncing')}</span>
          </div>
        ) : (
          <div
            className="grid grid-cols-4 grid-rows-4 gap-px"
            style={{
              border: '2px solid #808080',
              borderRightColor: '#FFFFFF',
              borderBottomColor: '#FFFFFF',
              backgroundColor: '#808080',
              padding: '1px',
            }}
          >
            {cells.map((cell, i) => (
              <div
                key={i}
                className="flex items-center justify-center"
                style={{
                  backgroundColor: cell.color,
                  height: '28px',
                  cursor: 'default',
                  position: 'relative',
                }}
                title={`${cell.symbol}: ${cell.change >= 0 ? '+' : ''}${cell.change.toFixed(1)}%`}
              >
                <span
                  className="font-bold text-center leading-none"
                  style={{
                    fontSize: '8px',
                    color: '#FFFFFF',
                    textShadow: '1px 1px 0 #000000',
                    overflow: 'hidden',
                    maxWidth: '90%',
                  }}
                >
                  {cell.symbol}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Legend — Win2k style */}
        <div
          className="mt-2 flex items-center justify-between px-1 text-[10px] font-bold"
          style={{ borderTop: '1px solid #808080', paddingTop: '4px' }}
        >
          <span style={{ color: '#CC0000' }}>{t('sentiment.fear')}</span>
          <div className="flex items-center gap-1">
            {['#CC0000','#CC4400','#998800','#888888','#007700','#009900','#00AA00'].map((c) => (
              <div
                key={c}
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: c,
                  border: '1px solid #808080',
                }}
              />
            ))}
          </div>
          <span style={{ color: '#007700' }}>{t('sentiment.greed')}</span>
        </div>
      </div>
    </div>
  );
}
