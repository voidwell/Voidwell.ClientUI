import { Type } from '@angular/core';

export function isType<T = unknown>(arg: unknown): arg is Type<T> {
    return arg && typeof arg === 'function' && arg.prototype && !!arg.prototype.constructor;
  }

export const TAGS_KEY = 'vw:tags';

export type TagTarget<T = unknown> = (Record<string, unknown> | Type<T>) & {
  [TAGS_KEY]?: Record<string, unknown>;
};

/**
 * Get all tags assigned to target
 * @param target tag target
 * @returns tags dictionary
 */
export function getTags<T = unknown>(target: TagTarget<T> | null): Record<string, unknown> {
    return (target && Reflect.get(target, TAGS_KEY)) || {};
  }