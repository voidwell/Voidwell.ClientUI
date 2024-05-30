// source: https://stackoverflow.com/a/53229857

/**
 * Type that doesn't contain any fields from T
 */
export type Without<T> = { [TKey in keyof T]?: never };

/**
 * T or U but not both
 */
export type Xor<T, U> = T | U extends Record<string, unknown> ? (Without<U> & T) | (Without<T> & U) : T | U;