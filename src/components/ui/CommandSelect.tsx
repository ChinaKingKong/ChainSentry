import type { ReactNode, SelectHTMLAttributes } from 'react';
import { MaterialIcon } from './MaterialIcon';

const COMMAND_SELECT_BASE =
  'scheme-dark min-w-0 w-full cursor-pointer appearance-none rounded-md border border-primary/20 bg-surface-container-low pl-2.5 pr-9 font-headline leading-none text-on-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[border-color,box-shadow,background-color] hover:border-primary/35 hover:bg-surface-container-high focus:border-primary-container/55 focus:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary-container/20 disabled:cursor-not-allowed disabled:opacity-50';

const SIZE_CLASS = {
  /** 指挥台筛选、代币「关注交易对」 */
  sm: 'py-[calc(0.25rem+2.5px)] text-xs font-semibold tabular-nums',
  /** 兑换面板支付资产等 */
  md: 'py-1.5 text-sm font-bold normal-case tracking-normal',
} as const;

export type CommandSelectSize = keyof typeof SIZE_CLASS;

/** 与 `<CommandSelect size="…" />` 内 `<select>` 同款外观，供带图标的自定义下拉触发器使用 */
export function commandSelectTriggerClasses(
  size: CommandSelectSize = 'sm'
): string {
  return `${COMMAND_SELECT_BASE} ${SIZE_CLASS[size]}`.trim();
}

export type CommandSelectProps = {
  /** 外层容器：控制宽度、flex 等 */
  className?: string;
  size?: CommandSelectSize;
  children: ReactNode;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'size'>;

/**
 * 指挥台风格原生 `<select>`：圆角、描边、内阴影、右侧 chevron。
 */
export function CommandSelect({
  className = '',
  size = 'sm',
  children,
  disabled,
  ...rest
}: CommandSelectProps) {
  /* flex + w-full：父级 flex-1 时整框同宽，箭头相对本容器贴右，不会漂到标签外 */
  const wrapperCls = `relative flex min-w-0 max-w-full items-stretch ${className}`.trim();
  const selectCls = `${COMMAND_SELECT_BASE} ${SIZE_CLASS[size]}`.trim();

  return (
    <div className={wrapperCls}>
      <select className={selectCls} disabled={disabled} {...rest}>
        {children}
      </select>
      <MaterialIcon
        name="expand_more"
        className={`pointer-events-none absolute right-2 top-1/2 z-[1] -translate-y-1/2 text-base text-primary-container/80 ${disabled ? 'opacity-40' : ''}`}
        aria-hidden
      />
    </div>
  );
}
