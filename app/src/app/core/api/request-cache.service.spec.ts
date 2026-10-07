import { RequestCache } from './request-cache.service';

describe('RequestCache', () => {
    afterEach(() => vi.useRealTimers());

    it('returns undefined for unknown urls', () => {
        expect(new RequestCache().get('/missing')).toBeUndefined();
    });

    it('returns a stored response', () => {
        const cache = new RequestCache();
        cache.put('/a', { ok: true });
        expect(cache.get('/a')).toEqual({ ok: true });
    });

    it('evicts entries older than 30 minutes on the next put', () => {
        vi.useFakeTimers();
        const cache = new RequestCache();
        cache.put('/old', 1);
        vi.advanceTimersByTime(31 * 60 * 1000);
        cache.put('/new', 2);
        expect(cache.get('/old')).toBeUndefined();
        expect(cache.get('/new')).toBe(2);
    });
});
