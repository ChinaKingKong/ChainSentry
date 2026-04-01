import { PublicKey } from '@solana/web3.js';

/** 浏览器扩展注入的最小连接接口（Phantom / Solflare 等） */
export type InjectedSolanaWallet = {
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<unknown>;
  disconnect?: () => Promise<void>;
  on?: (event: string, handler: () => void) => void;
  removeListener?: (event: string, handler: () => void) => void;
  isPhantom?: boolean;
  publicKey?: unknown;
};

function readPublicKeyFromConnectResult(
  result: unknown,
  provider: InjectedSolanaWallet
): unknown {
  if (
    result &&
    typeof result === 'object' &&
    'publicKey' in result &&
    (result as { publicKey?: unknown }).publicKey != null
  ) {
    return (result as { publicKey: unknown }).publicKey;
  }
  return provider.publicKey;
}

export function getPhantom(): InjectedSolanaWallet | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & {
    solana?: InjectedSolanaWallet;
    phantom?: { solana?: InjectedSolanaWallet };
  };
  const fromPhantom = w.phantom?.solana;
  if (fromPhantom?.connect) return fromPhantom;
  const s = w.solana;
  if (s?.connect && s.isPhantom !== false) return s;
  return null;
}

export function getSolflare(): InjectedSolanaWallet | null {
  if (typeof window === 'undefined') return null;
  const s = (window as Window & { solflare?: InjectedSolanaWallet }).solflare;
  if (!s?.connect) return null;
  return s;
}

export function toPublicKey(key: unknown): PublicKey {
  if (key instanceof PublicKey) return key;
  if (
    key &&
    typeof key === 'object' &&
    'toBase58' in key &&
    typeof (key as { toBase58: () => string }).toBase58 === 'function'
  ) {
    return new PublicKey((key as { toBase58: () => string }).toBase58());
  }
  if (
    key &&
    typeof key === 'object' &&
    'toBytes' in key &&
    typeof (key as { toBytes: () => Uint8Array }).toBytes === 'function'
  ) {
    return new PublicKey((key as { toBytes: () => Uint8Array }).toBytes());
  }
  if (typeof key === 'string') return new PublicKey(key);
  throw new Error('Invalid public key from wallet');
}

export async function connectInjectedWallet(
  provider: InjectedSolanaWallet
): Promise<PublicKey> {
  const result = await provider.connect();
  const raw = readPublicKeyFromConnectResult(result, provider);
  if (raw == null) throw new Error('Wallet did not return a public key');
  return toPublicKey(raw);
}

export async function trySilentPhantomReconnect(): Promise<PublicKey | null> {
  const ph = getPhantom();
  if (!ph?.connect) return null;
  try {
    await ph.connect({ onlyIfTrusted: true });
    const raw = ph.publicKey;
    if (raw == null) return null;
    return toPublicKey(raw);
  } catch {
    return null;
  }
}
