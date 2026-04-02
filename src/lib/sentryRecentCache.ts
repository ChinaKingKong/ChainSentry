const STORAGE_KEY = 'chainsentry:sentry-recent-v1';
const MAX_STORED = 32;
/** 与列表展示格数一致 */
export const SENTRY_RECENT_DISPLAY_LIMIT = 8;

export const SENTRY_RECENT_UPDATED_EVENT = 'chainsentry-sentry-recent';

export type SentryRecentCached = {
  mint: string;
  symbol: string;
  score: number;
  analyzedAt: number;
};

function safeParse(raw: string | null): SentryRecentCached[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    const out: SentryRecentCached[] = [];
    for (const x of v) {
      if (!x || typeof x !== 'object') continue;
      const o = x as Record<string, unknown>;
      const mint = typeof o.mint === 'string' ? o.mint.trim() : '';
      const symbol = typeof o.symbol === 'string' ? o.symbol.trim() : '';
      const score = typeof o.score === 'number' && Number.isFinite(o.score) ? o.score : 0;
      const analyzedAt =
        typeof o.analyzedAt === 'number' && Number.isFinite(o.analyzedAt)
          ? o.analyzedAt
          : 0;
      if (mint.length > 0)
        out.push({
          mint,
          symbol: symbol || `${mint.slice(0, 4)}…${mint.slice(-4)}`,
          score,
          analyzedAt,
        });
    }
    return out;
  } catch {
    return [];
  }
}

function persist(list: SentryRecentCached[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_STORED)));
  } catch {
    /* 私密模式等 */
  }
  try {
    window.dispatchEvent(new Event(SENTRY_RECENT_UPDATED_EVENT));
  } catch {
    /* ignore */
  }
}

export function readSentryRecentList(): SentryRecentCached[] {
  try {
    return safeParse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

/** 分析成功后调用：去重按 mint，新记录置顶 */
export function pushSentryRecentAnalysis(entry: Omit<SentryRecentCached, 'analyzedAt'> & { analyzedAt?: number }): void {
  const analyzedAt = entry.analyzedAt ?? Date.now();
  const row: SentryRecentCached = {
    mint: entry.mint.trim(),
    symbol: entry.symbol.trim() || `${entry.mint.trim().slice(0, 4)}…${entry.mint.trim().slice(-4)}`,
    score: Math.min(100, Math.max(0, Math.round(entry.score))),
    analyzedAt,
  };
  const prev = readSentryRecentList().filter((x) => x.mint !== row.mint);
  persist([row, ...prev]);
}
