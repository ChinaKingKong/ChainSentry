import { useState, type CSSProperties } from 'react';

/** 外层正圆形容器；描边在此层，不用 clip-path 以免裁掉 border */
const CIRCLE_BOX: CSSProperties = {
  borderRadius: '50%',
  overflow: 'hidden',
  aspectRatio: '1',
};

const CIRCLE_IMG: CSSProperties = {
  borderRadius: '50%',
  objectFit: 'cover',
  objectPosition: 'center',
  display: 'block',
  width: '100%',
  height: '100%',
  clipPath: 'circle(50% at 50% 50%)',
  WebkitClipPath: 'circle(50% at 50% 50%)',
};

export type TokenLogoProps = {
  logoUri?: string;
  symbol: string;
  /** 尺寸与布局（有图/无图都会用；不要在这里写 border/bg，除非两种状态都要） */
  className?: string;
  /** 仅无图或加载失败时叠加（边框、背景等）；有图时不生效 */
  fallbackFrameClassName?: string;
  /** 追加到 `<img>` 的 class */
  imgClassName?: string;
  /** 无图或加载失败时首字母的 class */
  fallbackClassName?: string;
};

/**
 * 圆形代币图标：优先 `logo_uri`（DexScreener `info.imageUrl`），失败则用符号前两字。
 */
export function TokenLogo({
  logoUri,
  symbol,
  className = 'h-8 w-8 shrink-0',
  fallbackFrameClassName = 'bg-primary/15',
  imgClassName = '',
  fallbackClassName = 'text-[8px] font-bold uppercase text-primary/80',
}: TokenLogoProps) {
  const [broken, setBroken] = useState(false);
  const initials = (symbol.slice(0, 2) || '?').toUpperCase();

  const shellBase =
    'box-border flex-none shrink-0 !rounded-full'.trim();
  const fallbackShell = `${shellBase} flex items-center justify-center ${className} ${fallbackFrameClassName}`.trim();
  const imageShell = `${shellBase} ${className}`.trim();

  if (!logoUri || broken) {
    return (
      <div style={CIRCLE_BOX} className={fallbackShell} aria-hidden>
        <span className={`font-headline ${fallbackClassName}`.trim()}>
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div style={CIRCLE_BOX} className={imageShell}>
      <img
        src={logoUri}
        alt=""
        style={CIRCLE_IMG}
        className={imgClassName}
        loading="lazy"
        onError={() => setBroken(true)}
      />
    </div>
  );
}
