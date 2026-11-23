import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api-client';
import { DEADLOCK_API_URL } from '../api-routes';
import {
    HeroAbilityOrderResponse, HeroBuildShapesResponse, HeroCommunityBuildsResponse, HeroDetailResponse, HeroItemBuildResponse,
    HeroItemsResponse, HeroPairsResponse, HeroStatsResponse, HeroTrendsResponse, ItemSlot, TierListResponse
} from '../models/deadlock/deadlock.model';
import { DeadlockQuery, queryParams } from './deadlock-query';

/** Voidwell.Deadlock `HeroAnalyticsController` (`deadlock/analytics/heroes`). */
@Injectable({ providedIn: 'root' })
export class HeroAnalyticsRepository {
    private api = inject(ApiClient);
    private readonly url = `${DEADLOCK_API_URL}/analytics/heroes`;

    getHeroStats(query: DeadlockQuery): Observable<HeroStatsResponse> {
        return this.api.get<HeroStatsResponse>(this.url, { params: queryParams(query), cache: true });
    }

    getTierList(query: DeadlockQuery, minGames = 100): Observable<TierListResponse> {
        return this.api.get<TierListResponse>(`${this.url}/tierlist`, { params: queryParams(query, { minGames }), cache: true });
    }

    /** Changes against the period of equal length just before the requested one. */
    getTrends(query: DeadlockQuery, minGames = 100): Observable<HeroTrendsResponse> {
        return this.api.get<HeroTrendsResponse>(`${this.url}/trends`, { params: queryParams(query, { minGames }), cache: true });
    }

    getHero(heroId: number, query: DeadlockQuery): Observable<HeroDetailResponse> {
        return this.api.get<HeroDetailResponse>(`${this.url}/${heroId}`, { params: queryParams(query), cache: true });
    }

    getItems(heroId: number, query: DeadlockQuery, slot?: ItemSlot, itemTier?: number): Observable<HeroItemsResponse> {
        return this.api.get<HeroItemsResponse>(`${this.url}/${heroId}/items`, { params: queryParams(query, { slot, itemTier }), cache: true });
    }

    getBuildShapes(heroId: number, query: DeadlockQuery): Observable<HeroBuildShapesResponse> {
        return this.api.get<HeroBuildShapesResponse>(`${this.url}/${heroId}/builds`, { params: queryParams(query), cache: true });
    }

    /** The shop items that gave the best odds of winning together, in buying order. Covers at most 60 days. */
    getItemBuild(heroId: number, query: DeadlockQuery): Observable<HeroItemBuildResponse> {
        return this.api.get<HeroItemBuildResponse>(`${this.url}/${heroId}/item-build`, { params: queryParams(query), cache: true });
    }

    getCommunityBuilds(heroId: number, query: DeadlockQuery, limit = 25): Observable<HeroCommunityBuildsResponse> {
        return this.api.get<HeroCommunityBuildsResponse>(`${this.url}/${heroId}/community-builds`, { params: queryParams(query, { limit }), cache: true });
    }

    getAbilityOrder(heroId: number, query: DeadlockQuery): Observable<HeroAbilityOrderResponse> {
        return this.api.get<HeroAbilityOrderResponse>(`${this.url}/${heroId}/ability-order`, { params: queryParams(query), cache: true });
    }

    getCounters(heroId: number, query: DeadlockQuery): Observable<HeroPairsResponse> {
        return this.api.get<HeroPairsResponse>(`${this.url}/${heroId}/counters`, { params: queryParams(query), cache: true });
    }

    getSynergies(heroId: number, query: DeadlockQuery): Observable<HeroPairsResponse> {
        return this.api.get<HeroPairsResponse>(`${this.url}/${heroId}/synergies`, { params: queryParams(query), cache: true });
    }

    getLane(heroId: number, query: DeadlockQuery): Observable<HeroPairsResponse> {
        return this.api.get<HeroPairsResponse>(`${this.url}/${heroId}/lane`, { params: queryParams(query), cache: true });
    }
}
