type BrandMarkProps = {
  className?: string;
  size?: number;
};

/** 与 `public/favicon.svg` 一致的 SENTINEL 品牌标（盾牌 + 链上之眼） */
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
