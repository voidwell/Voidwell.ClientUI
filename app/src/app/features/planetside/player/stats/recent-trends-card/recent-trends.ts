import { CharacterDetailsStatsHistory } from '@core/api/models/ps2/character.model';

/** How the history is bucketed: Census keeps 31 days, 13 Sunday-based weeks and 12 calendar months, all in UTC. */
export type TrendRange = 'day' | 'week' | 'month';

/** One day, week or month of play. */
export interface TrendBucket {
    /** The UTC start of the bucket. */
    start: Date;
    kills: number;
    deaths: number;
    /** Time played in seconds. */
    seconds: number;
    score: number;
    captures: number;
    defends: number;
    played: boolean;
}

/** All-time totals of the same stats, for comparison. */
export interface TrendTotals {
    kills: number;
    deaths: number;
    seconds: number;
    score: number;
}

export interface Trends {
    /** Oldest first, ending with the bucket that holds today. */
    buckets: TrendBucket[];
    lifetime: TrendTotals;
    /** The latest date the history was saved, or null when no row says. */
    asOf: Date | null;
}

/** How many buckets of each range the card shows. */
export const TREND_BUCKETS: Record<TrendRange, number> = { day: 30, week: 13, month: 12 };

const DAY_MS = 86_400_000;
// 1970-01-01 was a Thursday, so day 3 is the first Sunday.
const FIRST_SUNDAY = 3;

const STATS = {
    kills: 'kills',
    deaths: 'deaths',
    seconds: 'time',
    score: 'score',
    captures: 'facility_capture',
    defends: 'facility_defend'
} as const;

type BucketStat = keyof typeof STATS;

function dayKey(date: Date): number {
    return Math.floor(date.getTime() / DAY_MS);
}

function bucketKey(date: Date, range: TrendRange): number {
    switch (range) {
        case 'day': return dayKey(date);
        case 'week': return Math.floor((dayKey(date) - FIRST_SUNDAY) / 7);
        case 'month': return date.getUTCFullYear() * 12 + date.getUTCMonth();
    }
}

function bucketStart(key: number, range: TrendRange): Date {
    switch (range) {
        case 'day': return new Date(key * DAY_MS);
        case 'week': return new Date((key * 7 + FIRST_SUNDAY) * DAY_MS);
        case 'month': return new Date(Date.UTC(Math.floor(key / 12), key % 12, 1));
    }
}

function values(row: CharacterDetailsStatsHistory, range: TrendRange): number[] {
    return row[range] ?? [];
}

function parse(date: string | null | undefined): Date | null {
    if (!date) {
        return null;
    }
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Lines the stat history rows up on real dates and sums them into the buckets ending today.
 * Each row counts back from its own save date; a row stored before that date was recorded falls back to `fallbackSaveDate`.
 */
export function buildTrends(
    history: readonly CharacterDetailsStatsHistory[] | null | undefined,
    range: TrendRange,
    fallbackSaveDate: string | null | undefined,
    now: Date = new Date()
): Trends | null {
    const rows = (history ?? []).filter(r => r.statName);
    if (!rows.some(r => (Object.values(STATS) as string[]).includes(r.statName))) {
        return null;
    }

    const count = TREND_BUCKETS[range];
    const last = bucketKey(now, range);
    const first = last - count + 1;
    const buckets: TrendBucket[] = Array.from({ length: count }, (_, i) => ({
        start: bucketStart(first + i, range),
        kills: 0, deaths: 0, seconds: 0, score: 0, captures: 0, defends: 0, played: false
    }));
    const lifetime: TrendTotals = { kills: 0, deaths: 0, seconds: 0, score: 0 };
    const fallback = parse(fallbackSaveDate);
    let asOf: Date | null = null;

    for (const [field, statName] of Object.entries(STATS) as [BucketStat, string][]) {
        const row = rows.find(r => r.statName === statName);
        if (!row) {
            continue;
        }
        if (field in lifetime) {
            lifetime[field as keyof TrendTotals] = row.allTime ?? 0;
        }
        const saved = parse(row.lastSaveDate) ?? fallback;
        if (!saved) {
            continue;
        }
        if (!asOf || saved > asOf) {
            asOf = saved;
        }
        const newest = bucketKey(saved, range);
        values(row, range).forEach((value, offset) => {
            const index = newest - offset - first;
            if (index >= 0 && index < count && value) {
                buckets[index][field] += value;
            }
        });
    }

    for (const bucket of buckets) {
        bucket.played = bucket.seconds > 0 || bucket.kills > 0 || bucket.deaths > 0;
    }

    return { buckets, lifetime, asOf };
}

/** Sums the buckets of a range. */
export function totalTrends(buckets: readonly TrendBucket[]): TrendTotals & { captures: number; defends: number; played: number } {
    return buckets.reduce((sum, b) => ({
        kills: sum.kills + b.kills,
        deaths: sum.deaths + b.deaths,
        seconds: sum.seconds + b.seconds,
        score: sum.score + b.score,
        captures: sum.captures + b.captures,
        defends: sum.defends + b.defends,
        played: sum.played + (b.played ? 1 : 0)
    }), { kills: 0, deaths: 0, seconds: 0, score: 0, captures: 0, defends: 0, played: 0 });
}

/** The change from `baseline` to `value` as a fraction, or null when either is missing or the baseline is zero. */
export function change(value: number | null, baseline: number | null): number | null {
    return value === null || !baseline ? null : (value - baseline) / baseline;
}

/** A round number at or above `value` for the top of an axis: 1, 2, 2.5 or 5 times a power of ten. */
export function niceCeiling(value: number): number {
    if (!(value > 0)) {
        return 1;
    }
    const power = Math.pow(10, Math.floor(Math.log10(value)));
    const step = [1, 2, 2.5, 5, 10].find(s => s * power >= value) ?? 10;
    return step * power;
}
