import { HeroStatsResponse, HeroSummary, HeroTrendsResponse, RangeInfo, TierListResponse } from '@core/api/models/deadlock/deadlock.model';
import { heroRows, heroSortValue } from './heroes-figures';

const range: RangeInfo = { from: '2026-10-01', to: '2026-10-30', mode: 'ranked', minTier: null, maxTier: null };
const hero = (heroId: number, name: string | null, overrides: Partial<HeroSummary> = {}): HeroSummary => ({
    heroId, name, imageUrl: null, iconUrl: null, games: 500, wins: 260, winRate: 0.52, winRateLow: 0.48, winRateHigh: 0.56, pickRate: 0.03, banRate: null,
    avgKills: 6, avgDeaths: 5, avgAssists: 8, kda: 2.8, avgMatchMinutes: 30, soulsPerMinute: 900, lastHitsPerMinute: 4,
    damagePerMinute: null, damageTakenPerMinute: null, bossDamagePerMinute: null, healingPerMinute: null, accuracy: null, ...overrides
});

describe('heroRows', () => {
    const stats: HeroStatsResponse = { query: range, matches: 100, heroes: [hero(1, 'Abrams'), hero(2, null, { banRate: 0.1 })] };

    it('adds each hero its tier and its change, and leaves them null when they are not known', () => {
        const tiers: TierListResponse = { query: range, matches: 100, method: 'winRate', heroes: [{ tier: 'S', hero: hero(1, 'Abrams') }] };
        const trends: HeroTrendsResponse = { query: range, baseline: range, heroes: [{ heroId: 1, winRateChange: 0.021 } as HeroTrendsResponse['heroes'][number]] };

        const rows = heroRows(stats, tiers, trends);

        expect(rows.map(row => [row.name, row.tier, row.winChange])).toEqual([['Abrams', 'S', 0.021], ['Hero 2', null, null]]);
        expect(rows[1].banRate).toBe(0.1);
        expect(heroRows(stats, null, null).map(row => row.tier)).toEqual([null, null]);
    });

    it('sorts tiers best first, with unrated heroes last', () => {
        const rows = heroRows(stats, { query: range, matches: 1, method: '', heroes: [{ tier: 'A', hero: hero(1, 'Abrams') }] }, null);

        expect(heroSortValue(rows[0], 'tier')).toBeGreaterThan(0);
        expect(heroSortValue(rows[1], 'tier')).toBeNull();
        expect(heroSortValue(rows[0], 'winRate')).toBe(0.52);
        expect(heroSortValue(rows[0], 'damagePerMinute')).toBeNull();
    });
});
