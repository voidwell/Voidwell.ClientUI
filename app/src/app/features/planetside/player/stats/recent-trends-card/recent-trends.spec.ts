import { CharacterDetailsStatsHistory } from '@core/api/models/ps2/character.model';
import { buildTrends, change, niceCeiling, totalTrends } from './recent-trends';

const row = (statName: string, day: number[], lastSaveDate?: string, allTime = 0, week: number[] = [], month: number[] = []): CharacterDetailsStatsHistory =>
    ({ statName, allTime, oneLifeMax: 0, day, week, month, lastSaveDate });

// Tuesday, Nov 3 2026
const now = new Date('2026-11-03T20:00:00Z');

describe('buildTrends', () => {
    it('puts day[0] on the save day and counts back from there', () => {
        const trends = buildTrends([row('kills', [41, 0, 57], '2026-11-03T16:18:17Z')], 'day', null, now);
        const last = trends.buckets.slice(-3);

        expect(trends.buckets).toHaveLength(30);
        expect(last.map(b => b.start.toISOString().slice(0, 10))).toEqual(['2026-11-01', '2026-11-02', '2026-11-03']);
        expect(last.map(b => b.kills)).toEqual([57, 0, 41]);
    });

    it('lines up rows saved on different days', () => {
        const trends = buildTrends([
            row('kills', [10], '2026-11-03T10:00:00Z'),
            row('facility_defend', [4], '2026-10-30T10:00:00Z')
        ], 'day', null, now);
        const byDate = new Map(trends.buckets.map(b => [b.start.toISOString().slice(0, 10), b]));

        expect(byDate.get('2026-11-03').kills).toBe(10);
        expect(byDate.get('2026-11-03').defends).toBe(0);
        expect(byDate.get('2026-10-30').defends).toBe(4);
    });

    it('leaves recent days empty for a player who has not played since', () => {
        const trends = buildTrends([row('kills', [5], '2026-10-20T10:00:00Z'), row('time', [600], '2026-10-20T10:00:00Z')], 'day', null, now);

        expect(trends.buckets.at(-1).played).toBe(false);
        expect(trends.buckets.find(b => b.start.toISOString().startsWith('2026-10-20')).played).toBe(true);
    });

    it('drops values older than the window', () => {
        const day = Array.from({ length: 31 }, () => 1);
        const trends = buildTrends([row('kills', day, '2026-11-03T10:00:00Z')], 'day', null, now);

        expect(totalTrends(trends.buckets).kills).toBe(30);
    });

    it('uses Sunday-based weeks and calendar months', () => {
        const saved = '2026-11-03T16:18:17Z';
        const weeks = buildTrends([row('kills', [], saved, 0, [98, 0, 7])], 'week', null, now);
        const months = buildTrends([row('kills', [], saved, 0, [], [98, 550])], 'month', null, now);

        expect(weeks.buckets).toHaveLength(13);
        expect(weeks.buckets.at(-1).start.toISOString().slice(0, 10)).toBe('2026-11-01');
        expect(weeks.buckets.at(-3)).toMatchObject({ kills: 7 });
        expect(weeks.buckets.at(-3).start.toISOString().slice(0, 10)).toBe('2026-10-18');
        expect(months.buckets).toHaveLength(12);
        expect(months.buckets.slice(-2).map(b => [b.start.toISOString().slice(0, 7), b.kills])).toEqual([['2026-10', 550], ['2026-11', 98]]);
    });

    it('falls back to the character save date for rows stored without one', () => {
        const trends = buildTrends([row('kills', [9])], 'day', '2026-11-02T08:00:00Z', now);

        expect(trends.buckets.at(-2).kills).toBe(9);
        expect(trends.asOf.toISOString()).toBe('2026-11-02T08:00:00.000Z');
    });

    it('reports lifetime totals from the all-time values', () => {
        const trends = buildTrends([row('kills', [], undefined, 25080), row('deaths', [], undefined, 8030), row('time', [], undefined, 3600), row('score', [], undefined, 99)], 'day', null, now);

        expect(trends.lifetime).toEqual({ kills: 25080, deaths: 8030, seconds: 3600, score: 99 });
    });

    it('returns null without any of the stats it uses', () => {
        expect(buildTrends([], 'day', null, now)).toBeNull();
        expect(buildTrends([row('ribbons', [1], '2026-11-03T10:00:00Z')], 'day', null, now)).toBeNull();
    });
});

describe('change', () => {
    it('is a fraction of the baseline, or null when it cannot be worked out', () => {
        expect(change(3, 2)).toBe(.5);
        expect(change(null, 2)).toBeNull();
        expect(change(3, 0)).toBeNull();
    });
});

describe('niceCeiling', () => {
    it('rounds up to 1, 2, 2.5 or 5 times a power of ten', () => {
        expect(niceCeiling(0)).toBe(1);
        expect(niceCeiling(1.8)).toBe(2);
        expect(niceCeiling(2.3)).toBe(2.5);
        expect(niceCeiling(84)).toBe(100);
        expect(niceCeiling(410)).toBe(500);
    });
});
