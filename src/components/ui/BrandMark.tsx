type BrandMarkProps = {
  className?: string;
  size?: number;
};

/** 与 `public/favicon.svg` 一致：盾牌 + 链环 + 核心（顶栏 / 浏览器图标） */
export function BrandMark({ className = '', size = 36 }: BrandMarkProps) {
  return (
    <img
      src="/favicon.svg"
      alt=""
      width={size}
      height={size}
      className={`shrink-0 select-none ${className}`.trim()}
      decoding="async"
      draggable={false}
    />
  );
}
