import { Injectable } from '@angular/core';

const maxAge = 1000 * 1800; // 30 Minutes
@Injectable({ providedIn: 'root' })
export class RequestCache {

    cache = new Map<string, { url: string; response: unknown; lastRead: number }>();

    get(url: string): unknown {
        const cached = this.cache.get(url);

        if (!cached) {
            return undefined;
        }

        return cached.response;
    }

    put(url: string, response: unknown): void {
        const entry = { url, response, lastRead: Date.now() };
        this.cache.set(url, entry);

        const expired = Date.now() - maxAge;
        this.cache.forEach(expiredEntry => {
            if (expiredEntry.lastRead < expired) {
                this.cache.delete(expiredEntry.url);
            }
        });
    }
}