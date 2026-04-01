import { createContext } from 'react';
import type { PublicKey } from '@solana/web3.js';

export type ActiveWalletKind = 'phantom' | 'solflare' | null;

export type SolanaWalletContextValue = {
  publicKey: PublicKey | null;
  connecting: boolean;
  error: string | null;
  activeWallet: ActiveWalletKind;
  phantomAvailable: boolean;
  solflareAvailable: boolean;
  connectPhantom: () => Promise<boolean>;
  connectSolflare: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  clearError: () => void;
};

export const SolanaWalletContext = createContext<SolanaWalletContextValue | null>(null);
