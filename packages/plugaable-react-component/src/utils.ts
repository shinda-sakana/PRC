type AnyFunction = (...args: unknown[]) => unknown;
export const compose =
  (fnList: AnyFunction[]) =>
  <T>(val: T): T =>
    fnList.reduce((pre, fn) => fn(pre) as T, val as T);
