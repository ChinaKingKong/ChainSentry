import { useEffect, useMemo, useState } from 'react';
import {
  fetchJupiterQuote,
  fetchJupiterTokenDecimals,
  JUPITER_PAY_ASSETS,
  parseHumanToRawAmount,
  type JupiterPayAssetKey,
  type JupiterQuoteResult,
} from '../services/jupiterQuote';

type QuoteError = 'none' | 'invalid_amount' | 'no_route';

/** 买入：用 SOL/USDC 换目标代币；卖出：用目标代币换 SOL/USDC */
export type JupiterSwapDirection = 'buy' | 'sell';

export function useJupiterSwapQuote(
  tokenMint: string | undefined,
  payAmountHuman: string,
  payAsset: JupiterPayAssetKey,
  slippageBps: number,
  direction: JupiterSwapDirection
) {
  const [tokenDecimals, setTokenDecimals] = useState(9);
  const [quote, setQuote] = useState<JupiterQuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<QuoteError>('none');

  const inputMeta = JUPITER_PAY_ASSETS[payAsset];

  useEffect(() => {
    if (!tokenMint) return;
    const ac = new AbortController();
    void fetchJupiterTokenDecimals(tokenMint, ac.signal).then((d) => {
      if (!ac.signal.aborted && d != null) setTokenDecimals(d);
    });
    return () => ac.abort();
  }, [tokenMint]);

  const rawIn = useMemo(() => {
    const dec = direction === 'buy' ? inputMeta.decimals : tokenDecimals;
    return parseHumanToRawAmount(payAmountHuman, dec);
  }, [direction, payAmountHuman, inputMeta.decimals, tokenDecimals]);

  const tradeInputMint = useMemo(() => {
    if (!tokenMint) return '';
    return direction === 'buy' ? inputMeta.mint : tokenMint;
  }, [tokenMint, direction, inputMeta.mint]);

  const tradeOutputMint = useMemo(() => {
    if (!tokenMint) return '';
    return direction === 'buy' ? tokenMint : inputMeta.mint;
  }, [tokenMint, direction, inputMeta.mint]);

  const receiveDecimals =
    direction === 'buy' ? tokenDecimals : inputMeta.decimals;

  useEffect(() => {
    if (!tokenMint || !tradeInputMint || !tradeOutputMint) {
      setQuote(null);
      setError('none');
      setLoading(false);
      return;
    }

    const trimmed = payAmountHuman.trim();
    if (!trimmed) {
      setQuote(null);
      setError('none');
      setLoading(false);
      return;
    }

    if (rawIn <= 0n) {
      setQuote(null);
      setError('invalid_amount');
      setLoading(false);
      return;
    }

    const ac = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError('none');
      void (async () => {
        try {
          const q = await fetchJupiterQuote(
            tradeInputMint,
            tradeOutputMint,
            rawIn,
            slippageBps,
            ac.signal
          );
          if (ac.signal.aborted) return;
          if (!q) {
            setQuote(null);
            setError('no_route');
          } else {
            setQuote(q);
            setError('none');
          }
        } catch {
          if (!ac.signal.aborted) {
            setQuote(null);
            setError('no_route');
          }
        } finally {
          if (!ac.signal.aborted) setLoading(false);
        }
      })();
    }, 420);

    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  }, [
    tokenMint,
    tradeInputMint,
    tradeOutputMint,
    rawIn,
    payAmountHuman,
    slippageBps,
  ]);

  return {
    quote,
    loading,
    error,
    /** 用于格式化「预计收到」的 outAmount */
    receiveDecimals,
    rawInAmount: rawIn,
    inputMint: tradeInputMint,
    outputMint: tradeOutputMint,
    direction,
    tokenDecimals,
    paySymbol: inputMeta.symbol,
  };
}
