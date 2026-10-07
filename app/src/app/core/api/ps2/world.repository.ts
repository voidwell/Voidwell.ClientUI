import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ps2ApiClient } from './ps2-api-client';
import { PS2_API_URL } from '../api-routes';
import { World, WorldActivity, WorldPopulationHistory } from '../models/ps2/world.model';

/** Voidwell.DaybreakGames `WorldController` (`ps2/world`). */
@Injectable({ providedIn: 'root' })
export class WorldRepository {
    private api = inject(Ps2ApiClient);
    private readonly url = `${PS2_API_URL}/world`;

    /** All worlds, cached after the first request. */
    getWorlds(): Observable<World[]> {
        return this.api.get<World[]>(this.url, { cache: true });
    }

    /** Activity of a world over the last `periodHours` hours (at most 24). */
    getWorldActivity(worldId: number, periodHours: number): Observable<WorldActivity> {
        return this.api.get<WorldActivity>(`${this.url}/activity`, { params: { worldId, period: periodHours } });
    }

    getPopulationHistory(worldIds: number[]): Observable<WorldPopulationHistory> {
        return this.api.get<WorldPopulationHistory>(`${this.url}/population`, { params: { q: worldIds.join(',') } });
    }
}
