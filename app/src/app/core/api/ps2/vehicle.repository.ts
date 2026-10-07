import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ps2ApiClient } from './ps2-api-client';
import { PS2_API_URL } from '../api-routes';
import { VehicleInfo } from '../models/ps2/reference.model';

/** Voidwell.DaybreakGames `VehicleController` (`ps2/vehicle`). */
@Injectable({ providedIn: 'root' })
export class VehicleRepository {
    private api = inject(Ps2ApiClient);
    private readonly url = `${PS2_API_URL}/vehicle`;

    /** All vehicles, cached after the first request. */
    getVehicles(): Observable<VehicleInfo[]> {
        return this.api.get<VehicleInfo[]>(this.url, { cache: true, platform: false });
    }
}
