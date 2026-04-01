import { useEffect, useRef, useState } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const v = i18n.language.startsWith('zh') ? 'zh' : 'en';

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const pick = (lang: string) => {
    void i18n.changeLanguage(lang);
    setOpen(false);
  };

  const itemClass = (active: boolean) =>
    [
      'flex w-full items-center px-3 py-2 text-left font-headline text-xs tracking-wide transition-colors',
      active
        ? 'bg-primary/15 text-primary'
        : 'text-on-surface/85 hover:bg-surface-container-high hover:text-on-surface',
    ].join(' ');

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t('topNav.switchLanguage')}
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-outline-variant/20 bg-surface-container-low text-on-surface/75 transition-colors hover:border-primary/25 hover:bg-surface-container-high hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/45"
      >
        <Globe className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label={t('topNav.switchLanguage')}
          className="absolute right-0 top-full z-[60] mt-1.5 min-w-[132px] overflow-hidden rounded-md border border-outline-variant/20 bg-surface-container py-1 shadow-[0_10px_28px_rgba(0,0,0,0.45)]"
        >
          <li role="none">
            <button
              type="button"
              role="option"
              aria-selected={v === 'zh'}
              className={itemClass(v === 'zh')}
              onClick={() => pick('zh')}
            >
              {t('topNav.langZh')}
            </button>
          </li>
          <li role="none">
            <button
              type="button"
              role="option"
              aria-selected={v === 'en'}
              className={itemClass(v === 'en')}
              onClick={() => pick('en')}
            >
              {t('topNav.langEn')}
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
