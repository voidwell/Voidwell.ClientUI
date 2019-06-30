import { Injectable } from '@angular/core';

const maxAge = 1000 * 1800; // 30 Minutes
@Injectable()
export class RequestCache {

    cache = new Map();

    get(url: string): any | undefined {
        const cached = this.cache.get(url);

        if (!cached) {
            return undefined;
        }

        const isExpired = cached.lastRead < (Date.now() - maxAge);
        const expired = isExpired ? 'expired ' : '';
        return cached.response;
    }

    put(url: string, response: any): void {
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