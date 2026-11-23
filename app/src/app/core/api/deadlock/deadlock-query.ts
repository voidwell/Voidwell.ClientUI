import { QueryParams } from '../api-client';
import { DeadlockMode } from '../models/deadlock/deadlock.model';

/** The period, mode and rank filters every Deadlock analytics endpoint takes. */
export interface DeadlockQuery {
    /** How many days to cover, ending at the newest day with data. Ignored when `patch` is set. */
    days?: number;
    /** A patch release date, or `latest`. */
    patch?: string;
    mode: DeadlockMode;
    minTier?: number;
    maxTier?: number;
}

/** The query as request parameters, with `extra` endpoint parameters (such as `minGames`) added. */
export function queryParams(query: DeadlockQuery, extra: QueryParams = {}): QueryParams {
    // Rank tiers only apply to ranked matches, and a patch replaces the day count.
    const ranked = query.mode === 'ranked';
    return {
        days: query.patch ? undefined : query.days,
        patch: query.patch,
        mode: query.mode,
        minTier: ranked ? query.minTier : undefined,
        maxTier: ranked ? query.maxTier : undefined,
        ...extra
    };
}
