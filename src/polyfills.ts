/**
 * @solana/spl-token 等依赖 Node 的 Buffer；浏览器需在其它模块前注入。
 */
import { Buffer } from 'buffer';

const g = globalThis as typeof globalThis & { Buffer?: typeof Buffer };
if (typeof g.Buffer === 'undefined') {
  g.Buffer = Buffer;
}
