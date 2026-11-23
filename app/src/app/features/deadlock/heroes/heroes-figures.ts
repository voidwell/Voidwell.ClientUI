import { HeroStatsResponse, HeroTrendsResponse, TierListResponse } from '@core/api/models/deadlock/deadlock.model';

/** A hero as the heroes table shows it. A figure that is not known is `null`. */
export interface HeroRow {
    id: number;
    name: string;
    iconUrl: string | null;
    /** S to D, or `null` when the hero has too few games to be rated. */
    tier: string | null;
    games: number;
    winRate: number;
    winRateLow: number;
    winRateHigh: number;
    /** Change in win rate against the period before, as a fraction. */
    winChange: number | null;
    pickRate: number;
    banRate: number | null;
    kda: number;
    soulsPerMinute: number;
    damagePerMinute: number | null;
    healingPerMinute: number | null;
}

/** The tiers, best first. */
export const TIERS = ['S', 'A', 'B', 'C', 'D'];

/** The heroes with their tier and their change since the period before, by hero id. */
export function heroRows(stats: HeroStatsResponse, tiers: TierListResponse | null, trends: HeroTrendsResponse | null): HeroRow[] {
    const tierOf = new Map((tiers?.heroes ?? []).map(entry => [entry.hero.heroId, entry.tier]));
    const changeOf = new Map((trends?.heroes ?? []).map(trend => [trend.heroId, trend.winRateChange]));

    return stats.heroes.map((hero): HeroRow => ({
        id: hero.heroId,
        name: hero.name ?? `Hero ${hero.heroId}`,
        iconUrl: hero.iconUrl,
        tier: tierOf.get(hero.heroId) ?? null,
        games: hero.games,
        winRate: hero.winRate,
        winRateLow: hero.winRateLow,
        winRateHigh: hero.winRateHigh,
        winChange: changeOf.get(hero.heroId) ?? null,
        pickRate: hero.pickRate,
        banRate: hero.banRate,
        kda: hero.kda,
        soulsPerMinute: hero.soulsPerMinute,
        damagePerMinute: hero.damagePerMinute,
        healingPerMinute: hero.healingPerMinute
    }));
}

/** The value a table header sorts the heroes by. Tiers sort best first, with unrated heroes last. */
export function heroSortValue(row: HeroRow, key: string): string | number | null {
    if (key === 'tier') {
        const index = TIERS.indexOf(row.tier ?? '');
        return index < 0 ? null : TIERS.length - index;
    }

    return (row as unknown as Record<string, string | number | null>)[key] ?? null;
}
