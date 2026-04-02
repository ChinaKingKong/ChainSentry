/** 代币页 K 线周期（与 UI 按钮一致） */
export type ChartTf = '1m' | '5m' | '1h' | '1d';

export type SyntheticCandle = {
  open: number;
  high: number;
  low: number;
  close: number;
  bull: boolean;
};

const TF_VOL: Record<ChartTf, number> = {
  '1m': 0.0016,
  '5m': 0.003,
  '1h': 0.0085,
  '1d': 0.026,
};

const TF_BARS: Record<ChartTf, number> = {
  '1m': 40,
  '5m': 32,
  '1h': 24,
  '1d': 16,
};

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * DexScreener 开放 API 无 K 线柱接口：用 mint+周期 做种子生成确定性走势，
 * 最后一根收盘价对齐当前价，切换 1m/5m/1h/1d 会改变柱数与波动尺度。
 */
export function buildSyntheticCandles(
  tf: ChartTf,
  mint: string,
  lastPrice: number
): SyntheticCandle[] {
  if (!Number.isFinite(lastPrice) || lastPrice <= 0) return [];

  const rnd = mulberry32(hashSeed(`${mint}|${tf}`));
  const vol = TF_VOL[tf];
  const n = TF_BARS[tf];
  const closes: number[] = new Array(n);
  closes[n - 1] = lastPrice;
  for (let i = n - 2; i >= 0; i--) {
    const ret = (rnd() - 0.5) * 2 * vol;
    closes[i] = closes[i + 1] / (1 + ret);
  }

  const out: SyntheticCandle[] = [];
  for (let i = 0; i < n; i++) {
    const close = closes[i];
    const open =
      i === 0
        ? close * (1 + (rnd() - 0.5) * vol * 0.35)
        : closes[i - 1];
    const hi = Math.max(open, close) * (1 + rnd() * vol * 0.55);
    const lo = Math.min(open, close) * (1 - rnd() * vol * 0.55);
    out.push({
      open,
      high: hi,
      low: lo,
      close,
      bull: close >= open,
    });
  }
  return out;
}
