import { JUPITER_USDC_MINT } from '../services/jupiterQuote';

/**
 * 指挥台热门列表排除的稳定币：按 ticker 与部分 Solana 主网铸币地址匹配。
 * 符号不区分大小写；支持常见包装前缀如 wUSDC。
 */

const STABLECOIN_SYMBOLS = new Set(
  [
    'USDC',
    'USDT',
    'USDS',
    'DAI',
    'BUSD',
    'TUSD',
    'USDD',
    'FDUSD',
    'PYUSD',
    'USDE',
    'USDP',
    'GUSD',
    'FRAX',
    'LUSD',
    'YUSD',
    'EURC',
    'EURT',
    'USD1',
    'UXD',
    'USH',
    'USDH',
    'USDG',
    'CRVUSD',
    'SUSD',
    'OUSD',
    'MIM',
    'DOLA',
    'TRYB',
    'BRZ',
    'XSGD',
    'IDRT',
    'CJPY',
    'USDL',
    'USDX',
    'AUSD',
    'USYC',
  ].map((s) => s.toUpperCase())
);

/** 主网常见稳定 / 法币锚定铸币（补符号异常或仿盘 ticker） */
const STABLECOIN_MINTS = new Set<string>([
  JUPITER_USDC_MINT,
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
  'USDSwr9ApdHk5bvJKMjzff41FfuX8tWACAFX8FQeej8', // USDS
  '2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfnsFuqjYV', // PYUSD
  '6SigoDBU5fUT1yYUGWKHBkyNnoFCK3pPmrJhaniMdSn3', // EURC
  '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh', // BUSD (wormhole)
  '6nuaX3ogJim2MPP3XYsKPAOxxzyPKpiVQN1TYPxzvkUh', // UXD
]);

function symbolVariants(symbol: string): string[] {
  const u = symbol.trim().toUpperCase();
  const out = new Set<string>([u]);
  if (u.startsWith('W') && u.length > 2) out.add(u.slice(1));
  return [...out];
}

export function isDashboardStablecoin(token: {
  symbol: string;
  address: string;
}): boolean {
  if (STABLECOIN_MINTS.has(token.address)) return true;
  return symbolVariants(token.symbol).some((s) => STABLECOIN_SYMBOLS.has(s));
}
