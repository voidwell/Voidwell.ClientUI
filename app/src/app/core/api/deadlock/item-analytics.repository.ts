import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api-client';
import { DEADLOCK_API_URL } from '../api-routes';
import { ItemSlot, ItemStatsResponse } from '../models/deadlock/deadlock.model';
import { DeadlockQuery, queryParams } from './deadlock-query';

/** Voidwell.Deadlock `ItemAnalyticsController` (`deadlock/analytics/items`). */
@Injectable({ providedIn: 'root' })
export class ItemAnalyticsRepository {
    private api = inject(ApiClient);

    getItemStats(query: DeadlockQuery, slot?: ItemSlot, itemTier?: number): Observable<ItemStatsResponse> {
        return this.api.get<ItemStatsResponse>(`${DEADLOCK_API_URL}/analytics/items`, { params: queryParams(query, { slot, itemTier }), cache: true });
    }
}
