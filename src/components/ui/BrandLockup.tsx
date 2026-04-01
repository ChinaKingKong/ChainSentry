import { useTranslation } from 'react-i18next';
import { BrandMark } from './BrandMark';

type BrandLockupProps = {
  className?: string;
  /** 顶栏用链接，侧栏用普通块 */
  asLink?: boolean;
};

/**
 * 品牌组合：图标盒 + SENTINEL + 本地化副标题
 */
export function BrandLockup({ className = '', asLink = false }: BrandLockupProps) {
  const { t } = useTranslation();

  const inner = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border border-primary/20 bg-surface-container-low shadow-[0_0_16px_-6px_rgba(34,211,238,0.35)]">
        <BrandMark size={40} className="rounded-md" />
      </div>
      <div>
        <p className="font-headline text-lg font-black leading-none text-primary">
          SENTINEL
        </p>
        <p className="font-headline text-[10px] uppercase tracking-[0.2em] text-primary-container">
          {t('brand.tagline')}
        </p>
      </div>
    </>
  );

  const wrapClass =
    `flex items-center gap-3 ${asLink ? 'transition-opacity hover:opacity-90' : ''} ${className}`.trim();

  if (asLink) {
    return (
      <a href="/" className={wrapClass} aria-label={t('brand.ariaHome')}>
        {inner}
      </a>
    );
  }

  return <div className={wrapClass}>{inner}</div>;
}
