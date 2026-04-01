import { useTranslation } from 'react-i18next';
import { MaterialIcon } from '../ui/MaterialIcon';

export function QuickSwapPanel() {
  const { t } = useTranslation();

  return (
    <div
      style={{
        border: '2px solid #FFFFFF',
        borderRightColor: '#808080',
        borderBottomColor: '#808080',
        backgroundColor: '#D4D0C8',
      }}
    >
      {/* Win2k window title bar */}
      <div
        className="win-titlebar"
        style={{ fontSize: '11px', padding: '3px 8px' }}
      >
        <MaterialIcon name="currency_exchange" />
        <span>{t('quickSwap.title')}</span>
      </div>

      <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* Swap link rows — Win2k list items */}
        {[
          {
            href: 'https://jup.ag/swap/SOL-USDC',
            icon: 'currency_exchange',
            label: t('quickSwap.solUsdcPair'),
            sub: t('quickSwap.solUsdcSubtitle'),
          },
          {
            href: 'https://jup.ag/swap/JUP-SOL',
            icon: 'auto_fix_high',
            label: t('quickSwap.jupSolPair'),
            sub: t('quickSwap.jupSolSubtitle'),
          },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-2 py-1.5 text-[11px] no-underline"
            style={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #808080',
              borderRightColor: '#FFFFFF',
              borderBottomColor: '#FFFFFF',
              color: '#000000',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#000080';
              (e.currentTarget as HTMLAnchorElement).style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#FFFFFF';
              (e.currentTarget as HTMLAnchorElement).style.color = '#000000';
            }}
          >
            <MaterialIcon name={item.icon} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[11px] leading-tight">{item.label}</p>
              <p className="text-[10px]" style={{ color: '#666666' }}>{item.sub}</p>
            </div>
            <MaterialIcon name="chevron_right" className="shrink-0" />
          </a>
        ))}

        {/* Main CTA — Win2k default button style (darker border, bolder) */}
        <a
          href="https://jup.ag/"
          target="_blank"
          rel="noreferrer"
          className="win-btn mt-1 flex items-center justify-center gap-1 text-center text-[11px] font-bold no-underline"
          style={{
            /* Default button has slightly thicker outer border in Win2k */
            outline: '1px solid #000000',
            outlineOffset: '1px',
            color: '#000080',
            textDecoration: 'none',
            display: 'flex',
          }}
        >
          <MaterialIcon name="open_in_new" />
          {t('quickSwap.openTerminal')}
        </a>
      </div>
    </div>
  );
}
