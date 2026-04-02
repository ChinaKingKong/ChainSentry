import { useEffect, useRef, useState } from 'react';
import { shortenAddress } from '../../lib/format';
import type { Token } from '../../types/token';
import { commandSelectTriggerClasses } from './CommandSelect';
import { MaterialIcon } from './MaterialIcon';
import { TokenLogo } from './TokenLogo';

export type TokenFocusSelectProps = {
  className?: string;
  value: string;
  onChange: (mintAddress: string) => void;
  tokens: Token[];
  /** 当前页代币；若被列表规则筛掉，仍用于触发器展示 */
  fallbackToken?: Token | null;
  'aria-label'?: string;
  disabled?: boolean;
};

/**
 * 「关注交易对」自定义下拉：选项左侧展示 DexScreener 图标（原生 `<select>` 无法内嵌图片）。
 */
export function TokenFocusSelect({
  className = '',
  value,
  onChange,
  tokens,
  fallbackToken = null,
  'aria-label': ariaLabel,
  disabled,
}: TokenFocusSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected =
    tokens.find((t) => t.address === value) ??
    (fallbackToken?.address === value ? fallbackToken : undefined);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const triggerCls = `${commandSelectTriggerClasses('sm')} relative flex min-h-0 min-w-0 flex-1 items-center gap-2 text-left ${disabled ? 'cursor-not-allowed opacity-50' : ''}`;

  return (
    <div
      ref={rootRef}
      className={`relative z-[80] flex min-w-0 max-w-full items-stretch ${className}`.trim()}
    >
      <button
        type="button"
        disabled={disabled || tokens.length === 0}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={triggerCls}
        onClick={() => {
          if (!disabled && tokens.length > 0) setOpen((o) => !o);
        }}
      >
        {selected ? (
          <>
            <TokenLogo
              logoUri={selected.logo_uri}
              symbol={selected.symbol}
              className="h-5 w-5 shrink-0"
              fallbackFrameClassName="border border-primary/25 bg-primary/10"
            />
            <span className="min-w-0 flex-1 truncate font-semibold tabular-nums">
              {selected.symbol} · {shortenAddress(selected.address, 3)}
            </span>
          </>
        ) : (
          <span className="text-on-surface-variant">—</span>
        )}
        <MaterialIcon
          name="expand_more"
          className={`pointer-events-none absolute right-2 top-1/2 z-[1] -translate-y-1/2 text-base text-primary-container/80 ${open ? 'rotate-180' : ''} transition-transform`}
          aria-hidden
        />
      </button>

      {open && tokens.length > 0 ? (
        <ul
          role="listbox"
          className="absolute left-0 top-[calc(100%+4px)] z-[90] max-h-64 min-w-full overflow-auto rounded-md border border-primary/25 bg-surface-container-highest py-1 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        >
          {tokens.map((t) => {
            const active = t.address === value;
            return (
              <li key={t.address} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={`flex w-full items-center gap-2 px-2.5 py-2 text-left text-xs transition-colors ${
                    active
                      ? 'bg-primary/20 text-primary'
                      : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                  onClick={() => {
                    onChange(t.address);
                    setOpen(false);
                  }}
                >
                  {active ? (
                    <MaterialIcon
                      name="check"
                      className="shrink-0 text-sm text-primary"
                      aria-hidden
                    />
                  ) : (
                    <span className="w-4 shrink-0" aria-hidden />
                  )}
                  <TokenLogo
                    logoUri={t.logo_uri}
                    symbol={t.symbol}
                    className="h-5 w-5 shrink-0"
                    fallbackFrameClassName="border border-primary/25 bg-primary/10"
                  />
                  <span className="min-w-0 flex-1 truncate font-semibold tabular-nums">
                    {t.symbol} · {shortenAddress(t.address, 3)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
