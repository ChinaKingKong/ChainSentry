/**
 * @solana/spl-token 等依赖 Node 的 Buffer；浏览器需在其它模块前注入。
 */
import { Buffer } from 'buffer';

if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer;
}
