import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { PublicKey } from '@solana/web3.js';
import {
  connectInjectedWallet,
  getPhantom,
  getSolflare,
  trySilentPhantomReconnect,
} from './injectedProviders';
import { SolanaWalletContext, type ActiveWalletKind } from './solanaWalletContext';

export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [activeWallet, setActiveWallet] = useState<ActiveWalletKind>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phantomAvailable = typeof window !== 'undefined' && !!getPhantom();
  const solflareAvailable = typeof window !== 'undefined' && !!getSolflare();

  const disconnect = useCallback(async () => {
    const ph = getPhantom();
    const sf = getSolflare();
    try {
      if (activeWallet === 'phantom' && ph?.disconnect) await ph.disconnect();
      else if (activeWallet === 'solflare' && sf?.disconnect) await sf.disconnect();
    } finally {
      setPublicKey(null);
      setActiveWallet(null);
    }
  }, [activeWallet]);

  useEffect(() => {
    void (async () => {
      const pk = await trySilentPhantomReconnect();
      if (pk) {
        setPublicKey(pk);
        setActiveWallet('phantom');
      }
    })();
  }, []);

  useEffect(() => {
    const ph = getPhantom();
    if (!ph?.on) return;
    const onDisconnect = () => {
      setPublicKey(null);
      setActiveWallet(null);
    };
    ph.on('disconnect', onDisconnect);
    return () => {
      ph.removeListener?.('disconnect', onDisconnect);
    };
  }, []);

  useEffect(() => {
    const sf = getSolflare();
    if (!sf?.on) return;
    const onDisconnect = () => {
      setPublicKey(null);
      setActiveWallet(null);
    };
    sf.on('disconnect', onDisconnect);
    return () => {
      sf.removeListener?.('disconnect', onDisconnect);
    };
  }, []);

  const connectPhantom = useCallback(async (): Promise<boolean> => {
    setError(null);
    const ph = getPhantom();
    if (!ph) {
      setError('not_installed');
      return false;
    }
    setConnecting(true);
    try {
      const pk = await connectInjectedWallet(ph);
      setPublicKey(pk);
      setActiveWallet('phantom');
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'connect_failed';
      const rejected =
        msg === 'User rejected the request.' ||
        /reject|denied|cancel/i.test(msg);
      setError(rejected ? 'user_rejected' : msg);
      return false;
    } finally {
      setConnecting(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const connectSolflare = useCallback(async (): Promise<boolean> => {
    setError(null);
    const sf = getSolflare();
    if (!sf) {
      setError('not_installed');
      return false;
    }
    setConnecting(true);
    try {
      const pk = await connectInjectedWallet(sf);
      setPublicKey(pk);
      setActiveWallet('solflare');
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'connect_failed';
      const rejected =
        msg === 'User rejected the request.' ||
        /reject|denied|cancel/i.test(msg);
      setError(rejected ? 'user_rejected' : msg);
      return false;
    } finally {
      setConnecting(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      publicKey,
      connecting,
      error,
      activeWallet,
      phantomAvailable,
      solflareAvailable,
      connectPhantom,
      connectSolflare,
      disconnect,
      clearError,
    }),
    [
      publicKey,
      connecting,
      error,
      activeWallet,
      phantomAvailable,
      solflareAvailable,
      connectPhantom,
      connectSolflare,
      disconnect,
      clearError,
    ]
  );

  return (
    <SolanaWalletContext.Provider value={value}>{children}</SolanaWalletContext.Provider>
  );
}
