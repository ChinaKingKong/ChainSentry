import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSolanaWallet } from '../../wallet/useSolanaWallet';
import { MaterialIcon } from '../ui/MaterialIcon';

export function WalletConnectButton() {
  const { t } = useTranslation();
  const {
    publicKey,
    connecting,
    error,
    phantomAvailable,
    solflareAvailable,
    connectPhantom,
    connectSolflare,
    disconnect,
    clearError,
  } = useSolanaWallet();

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  const errText = error
    ? error === 'not_installed'
      ? t('topNav.walletNotInstalled')
      : error === 'user_rejected'
        ? t('topNav.walletUserRejected')
        : t('topNav.walletConnectFailed')
    : null;

  if (publicKey) {
    const addr = publicKey.toBase58();
    const short = `${addr.slice(0, 4)}…${addr.slice(-4)}`;
    return (
      <div className="flex max-w-[min(100%,14rem)] items-center gap-2">
        <span
          className="hidden truncate font-mono text-xs text-on-surface/80 sm:inline"
          title={addr}
        >
          {short}
        </span>
        <button
          type="button"
          onClick={() => void disconnect()}
          className="shrink-0 rounded-sm border border-outline-variant/30 bg-surface-container-low px-3 py-1.5 font-headline text-xs font-bold text-on-surface/90 transition-all hover:border-error/40 hover:text-error active:scale-95"
        >
          {t('topNav.disconnectWallet')}
        </button>
      </div>
    );
  }

  const baseBtn =
    'rounded-sm bg-primary-container px-3 py-1.5 font-headline text-sm font-bold text-on-primary-container shadow-[0_0_15px_-3px_rgba(34,211,238,0.4)] transition-all duration-150 active:scale-95 sm:px-5 disabled:opacity-50';

  const rowClass =
    'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left font-headline text-sm transition-colors hover:bg-surface-container-high';

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={baseBtn}
        disabled={connecting}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() =>
          setOpen((o) => {
            if (!o) clearError();
            return !o;
          })
        }
      >
        {connecting ? t('topNav.walletConnecting') : t('topNav.connectWallet')}
      </button>
      {open ? (
        <>
          <div
            className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-[2px]"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-label={t('topNav.pickWallet')}
            className="absolute right-0 top-[calc(100%+0.5rem)] z-[100] w-[min(calc(100vw-2rem),16rem)] rounded-lg border border-outline-variant/20 bg-surface-container py-2 shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
          >
            <p className="border-b border-outline-variant/10 px-3 pb-2 pt-1 font-label text-[10px] uppercase tracking-widest text-on-surface/50">
              {t('topNav.pickWallet')}
            </p>
            <div className="p-1">
              <button
                type="button"
                className={rowClass}
                disabled={!phantomAvailable || connecting}
                onClick={() => {
                  void connectPhantom().then((ok) => {
                    if (ok) setOpen(false);
                  });
                }}
              >
                <MaterialIcon name="account_balance_wallet" className="text-primary-container" />
                <span className="flex-1">{t('topNav.walletPhantom')}</span>
                {!phantomAvailable ? (
                  <span className="text-[10px] text-on-surface/40">{t('topNav.walletMissing')}</span>
                ) : null}
              </button>
              <button
                type="button"
                className={rowClass}
                disabled={!solflareAvailable || connecting}
                onClick={() => {
                  void connectSolflare().then((ok) => {
                    if (ok) setOpen(false);
                  });
                }}
              >
                <MaterialIcon name="account_balance_wallet" className="text-secondary" />
                <span className="flex-1">{t('topNav.walletSolflare')}</span>
                {!solflareAvailable ? (
                  <span className="text-[10px] text-on-surface/40">{t('topNav.walletMissing')}</span>
                ) : null}
              </button>
            </div>
            {errText ? (
              <p className="border-t border-outline-variant/10 px-3 py-2 text-[11px] text-error">
                {errText}
              </p>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
