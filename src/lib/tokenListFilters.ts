import type { Token } from '../types/token';
import { isDashboardStablecoin } from './isDashboardStablecoin';

/** 指挥台与代币页「关注交易对」共用：池流动性下限（USD） */
export const FOCUS_DASHBOARD_MIN_LIQUIDITY_USD = 100_000;

/** 流动性、图标、非稳定币 — 与指挥台列表一致 */
export function passesFocusDashboardTokenRules(token: Token): boolean {
  return (
    token.liquidity >= FOCUS_DASHBOARD_MIN_LIQUIDITY_USD &&
    Boolean(token.logo_uri?.trim()) &&
    !isDashboardStablecoin(token)
  );
}
