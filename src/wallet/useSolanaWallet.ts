import { useContext } from 'react';
import { SolanaWalletContext, type SolanaWalletContextValue } from './solanaWalletContext';

export function useSolanaWallet(): SolanaWalletContextValue {
  const ctx = useContext(SolanaWalletContext);
  if (!ctx) {
    throw new Error('useSolanaWallet must be used within SolanaWalletProvider');
  }
  return ctx;
}
