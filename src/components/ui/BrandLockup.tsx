import { useTranslation } from 'react-i18next';

type BrandLockupProps = {
  className?: string;
  asLink?: boolean;
};

/**
 * Win2k style brand lockup — flat text logo, no glass effects.
 */
export function BrandLockup({ className = '', asLink = false }: BrandLockupProps) {
  const { t } = useTranslation();

  const inner = (
    <div className="flex items-center gap-1.5">
      {/* Win2k app icon — small pixel-art style box */}
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center text-[10px] font-bold select-none"
        style={{
          backgroundColor: '#000080',
          color: '#FFFFFF',
          border: '2px solid #FFFFFF',
          borderRightColor: '#808080',
          borderBottomColor: '#808080',
          fontFamily: 'Tahoma, sans-serif',
        }}
        aria-hidden
      >
        CS
      </div>
      <div>
        <p
          className="font-bold leading-none"
          style={{
            fontSize: '13px',
            color: '#000080',
            fontFamily: 'Tahoma, "MS Sans Serif", Arial, sans-serif',
            letterSpacing: '0',
          }}
        >
          ChainSentry
        </p>
        <p
          className="leading-none"
          style={{
            fontSize: '9px',
            color: '#444444',
            fontFamily: 'Tahoma, "MS Sans Serif", Arial, sans-serif',
            letterSpacing: '0.05em',
          }}
        >
          {t('brand.tagline')}
        </p>
      </div>
    </div>
  );

  const wrapClass = `inline-flex items-center ${asLink ? 'cursor-pointer' : ''} ${className}`.trim();

  if (asLink) {
    return (
      <a href="/" className={wrapClass} aria-label={t('brand.ariaHome')}>
        {inner}
      </a>
    );
  }

  return <div className={wrapClass}>{inner}</div>;
}
