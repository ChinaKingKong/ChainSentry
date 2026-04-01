import { BrandMark } from './BrandMark';

type BrandLockupProps = {
  className?: string;
  /** 顶栏用链接，侧栏用普通块 */
  asLink?: boolean;
};

/**
 * 品牌组合：图标盒 + SENTINEL + ON-CHAIN EYE（与侧栏红框区域一致）
 */
export function BrandLockup({ className = '', asLink = false }: BrandLockupProps) {
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
          On-Chain Eye
        </p>
      </div>
    </>
  );

  const wrapClass =
    `flex items-center gap-3 ${asLink ? 'transition-opacity hover:opacity-90' : ''} ${className}`.trim();

  if (asLink) {
    return (
      <a href="/" className={wrapClass} aria-label="SENTINEL — On-Chain Eye">
        {inner}
      </a>
    );
  }

  return <div className={wrapClass}>{inner}</div>;
}
