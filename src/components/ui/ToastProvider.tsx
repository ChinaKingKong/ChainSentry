import { useCallback, useRef, useState, type ReactNode } from 'react';
import { ToastContext } from './toastContext';

type ToastItem = { id: number; message: string };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const show = useCallback((message: string) => {
    const id = ++idRef.current;
    setItems((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        className="pointer-events-none fixed top-6 left-1/2 z-[300] flex w-full max-w-md -translate-x-1/2 flex-col items-center gap-2 px-4"
        aria-live="polite"
      >
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            className="pointer-events-auto w-full rounded-lg border border-primary/30 bg-surface-container-high/95 px-4 py-3 text-center font-headline text-sm text-on-surface shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-sm"
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
