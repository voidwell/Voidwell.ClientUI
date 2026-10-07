import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ps2ApiClient } from './ps2-api-client';
import { PS2_API_URL } from '../api-routes';
import { Alert, AlertResult } from '../models/ps2/alert.model';

/** Voidwell.DaybreakGames `AlertController` (`ps2/alert`). */
@Injectable({ providedIn: 'root' })
export class AlertRepository {
    private api = inject(Ps2ApiClient);
    private readonly url = `${PS2_API_URL}/alert`;

    /** Lists alerts, newest first, optionally limited to a single world. */
    getAlerts(pageNumber: number, worldId?: number): Observable<Alert[]> {
        return this.api.get<Alert[]>(`${this.url}/alerts/${pageNumber}`, { params: { worldId } });
    }

    getAlert(worldId: number | string, instanceId: number | string): Observable<AlertResult> {
        return this.api.get<AlertResult>(`${this.url}/${worldId}/${instanceId}`);
    }
}
