import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ps2ApiClient } from './ps2-api-client';
import { PS2_API_URL } from '../api-routes';
import { OnlineCharacter } from '../models/ps2/character.model';
import { ZoneRegionOwnership } from '../models/ps2/map.model';
import { WorldOnlineState } from '../models/ps2/world-state.model';

/** Voidwell.DaybreakGames `WorldStateController` (`ps2/worldState`). */
@Injectable({ providedIn: 'root' })
export class WorldStateRepository {
    private api = inject(Ps2ApiClient);
    private readonly url = `${PS2_API_URL}/worldState`;

    getWorldStates(): Observable<WorldOnlineState[]> {
        return this.api.get<WorldOnlineState[]>(this.url);
    }

    getWorldState(worldId: number): Observable<WorldOnlineState> {
        return this.api.get<WorldOnlineState>(`${this.url}/${worldId}`);
    }

    getOnlinePlayers(worldId: number): Observable<OnlineCharacter[]> {
        return this.api.get<OnlineCharacter[]>(`${this.url}/${worldId}/players`);
    }

    getZoneOwnership(worldId: number, zoneId: number): Observable<ZoneRegionOwnership[]> {
        return this.api.get<ZoneRegionOwnership[]>(`${this.url}/${worldId}/${zoneId}/map`);
    }

    /** Administrator only. */
    setupWorldZones(worldId: number): Observable<void> {
        return this.api.post<void>(`${this.url}/${worldId}/zone`, null, { auth: true });
    }
}
