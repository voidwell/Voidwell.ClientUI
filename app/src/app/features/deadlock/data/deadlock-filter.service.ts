import { Injectable, computed, signal } from '@angular/core';
import { DeadlockQuery } from '@core/api/deadlock/deadlock-query';
import { DeadlockMode } from '@core/api/models/deadlock/deadlock.model';

/** How far back the analytics look: a number of days, or since the latest patch. */
export type DeadlockPeriod = '7' | '30' | '90' | 'patch';

/** A band of rank tiers, for ranked matches. */
export type RankBracket = 'all' | 'low' | 'mid' | 'high';

/** The tiers each bracket covers; `all` covers every tier. */
export const RANK_BRACKETS: Record<Exclude<RankBracket, 'all'>, { minTier: number; maxTier: number }> = {
    low: { minTier: 0, maxTier: 3 },
    mid: { minTier: 4, maxTier: 7 },
    high: { minTier: 8, maxTier: 11 }
};

/** The period, mode and rank filters shared by every page of the Deadlock area. */
@Injectable()
export class DeadlockFilterService {
    readonly mode = signal<DeadlockMode>('ranked');
    readonly period = signal<DeadlockPeriod>('30');
    readonly bracket = signal<RankBracket>('all');

    readonly query = computed<DeadlockQuery>(() => {
        const period = this.period();
        const mode = this.mode();
        const bracket = this.bracket();

        return {
            mode,
            ...(period === 'patch' ? { patch: 'latest' } : { days: Number(period) }),
            ...(mode === 'ranked' && bracket !== 'all' ? RANK_BRACKETS[bracket] : {})
        };
    });
}
