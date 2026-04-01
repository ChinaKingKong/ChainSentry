import { PublicKey } from '@solana/web3.js';

/** 返回规范 base58 地址，或无效时 null */
export function tryParseSolanaAddress(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  try {
    return new PublicKey(s).toBase58();
  } catch {
    return null;
  }
}
