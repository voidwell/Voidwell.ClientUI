import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ps2ApiClient } from './ps2-api-client';
import { PS2_API_URL } from '../api-routes';
import { CombatReportRequest } from '../models/ps2/combat-report.model';
import { PopulationPeriod } from '../models/ps2/common.model';
import { MapScore, SnapshotRequest, ZoneMap, ZoneSnapshot } from '../models/ps2/map.model';

/** Voidwell.DaybreakGames `MapController` (`ps2/map`). */
@Injectable({ providedIn: 'root' })
export class MapRepository {
    private api = inject(Ps2ApiClient);
    private readonly url = `${PS2_API_URL}/map`;

    /** Static zone layout, cached after the first request per zone. */
    getZoneMap(zoneId: number): Observable<ZoneMap> {
        return this.api.get<ZoneMap>(`${this.url}/${zoneId}`, { cache: true });
    }

    /** Current territory control of a zone. */
    getTerritory(worldId: number, zoneId: number): Observable<MapScore | null> {
        return this.api.get<MapScore | null>(`${this.url}/territory/${worldId}/${zoneId}`);
    }

    getPopulation(worldId: number, zoneId: number): Observable<PopulationPeriod | null> {
        return this.api.get<PopulationPeriod | null>(`${this.url}/population/${worldId}/${zoneId}`);
    }

    /** Territory control per faction at the end of the given period. */
    getTerritoryFromDate(request: CombatReportRequest): Observable<number[]> {
        return this.api.post<number[], CombatReportRequest>(`${this.url}/territory`, request);
    }

    createSnapshot(request: SnapshotRequest): Observable<void> {
        return this.api.post<void, SnapshotRequest>(`${this.url}/snapshot/create`, request);
    }

    getSnapshot(request: SnapshotRequest): Observable<ZoneSnapshot> {
        return this.api.post<ZoneSnapshot, SnapshotRequest>(`${this.url}/snapshot`, request);
    }
}
