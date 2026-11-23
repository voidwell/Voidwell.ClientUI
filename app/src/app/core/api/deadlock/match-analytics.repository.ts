import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api-client';
import { DEADLOCK_API_URL } from '../api-routes';
import {
    CompositionsResponse, HeroCurvesResponse, HeroSoulsSourcesResponse, LeadResponse, LeaversResponse, ObjectivesResponse,
    OverviewResponse, RanksResponse
} from '../models/deadlock/deadlock.model';
import { DeadlockQuery, queryParams } from './deadlock-query';

/** Voidwell.Deadlock `MatchAnalyticsController` (`deadlock/analytics`): matches as a whole. */
@Injectable({ providedIn: 'root' })
export class MatchAnalyticsRepository {
    private api = inject(ApiClient);
    private readonly url = `${DEADLOCK_API_URL}/analytics`;

    getOverview(query: DeadlockQuery): Observable<OverviewResponse> {
        return this.api.get<OverviewResponse>(`${this.url}/overview`, { params: queryParams(query), cache: true });
    }

    getRanks(query: DeadlockQuery): Observable<RanksResponse> {
        return this.api.get<RanksResponse>(`${this.url}/ranks`, { params: queryParams(query), cache: true });
    }

    getObjectives(query: DeadlockQuery): Observable<ObjectivesResponse> {
        return this.api.get<ObjectivesResponse>(`${this.url}/objectives`, { params: queryParams(query), cache: true });
    }

    getLeavers(query: DeadlockQuery): Observable<LeaversResponse> {
        return this.api.get<LeaversResponse>(`${this.url}/leavers`, { params: queryParams(query), cache: true });
    }
}

/** Voidwell.Deadlock `CurveAnalyticsController` (`deadlock/analytics`): how matches develop. */
@Injectable({ providedIn: 'root' })
export class CurveAnalyticsRepository {
    private api = inject(ApiClient);
    private readonly url = `${DEADLOCK_API_URL}/analytics`;

    getHeroCurves(heroId: number, query: DeadlockQuery): Observable<HeroCurvesResponse> {
        return this.api.get<HeroCurvesResponse>(`${this.url}/heroes/${heroId}/curves`, { params: queryParams(query), cache: true });
    }

    getSoulsSources(heroId: number, query: DeadlockQuery): Observable<HeroSoulsSourcesResponse> {
        return this.api.get<HeroSoulsSourcesResponse>(`${this.url}/heroes/${heroId}/souls-sources`, { params: queryParams(query), cache: true });
    }

    /** How often the team ahead on souls wins, by sample time and size of lead. */
    getLead(query: DeadlockQuery): Observable<LeadResponse> {
        return this.api.get<LeadResponse>(`${this.url}/lead`, { params: queryParams(query), cache: true });
    }
}

/** Voidwell.Deadlock `CompositionAnalyticsController` (`deadlock/analytics/compositions`). */
@Injectable({ providedIn: 'root' })
export class CompositionAnalyticsRepository {
    private api = inject(ApiClient);

    getCompositions(query: DeadlockQuery): Observable<CompositionsResponse> {
        return this.api.get<CompositionsResponse>(`${DEADLOCK_API_URL}/analytics/compositions`, { params: queryParams(query), cache: true });
    }
}
