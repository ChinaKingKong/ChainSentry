import { Connection } from '@solana/web3.js';
import { SOLANA_RPC_URL } from '../config/solana';

let connection: Connection | null = null;

export function getSolanaConnection(): Connection {
  if (!connection) {
    connection = new Connection(SOLANA_RPC_URL, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60_000,
    });
  }
  return connection;
}

export type SolanaChainStats = {
  slot: number;
  epoch: number;
};

export async function fetchSolanaChainStats(): Promise<SolanaChainStats> {
  const c = getSolanaConnection();
  const [slot, epochInfo] = await Promise.all([
    c.getSlot('finalized'),
    c.getEpochInfo(),
  ]);
  return {
    slot,
    epoch: epochInfo.epoch,
  };
}
