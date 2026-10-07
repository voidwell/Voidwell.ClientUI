import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ps2ApiClient } from './ps2-api-client';
import { PS2_API_URL } from '../api-routes';
import { Zone } from '../models/ps2/reference.model';

/** Voidwell.DaybreakGames `ZoneController` (`ps2/zone`). */
@Injectable({ providedIn: 'root' })
export class ZoneRepository {
    private api = inject(Ps2ApiClient);
    private readonly url = `${PS2_API_URL}/zone`;

    /** All zones, cached after the first request. */
    getZones(): Observable<Zone[]> {
        return this.api.get<Zone[]>(this.url, { cache: true, platform: false });
    }
}
