/**
 * 在 ms 毫秒内未完成则 reject，避免公共 RPC 挂起导致上层 Promise 永不结束。
 */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = window.setTimeout(() => {
      reject(new Error(`timeout after ${ms}ms`));
    }, ms);
    promise.then(
      (v) => {
        window.clearTimeout(id);
        resolve(v);
      },
      (e) => {
        window.clearTimeout(id);
        reject(e);
      }
    );
  });
}
