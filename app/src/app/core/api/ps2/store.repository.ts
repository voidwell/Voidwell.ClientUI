import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ps2ApiClient } from './ps2-api-client';
import { PS2_API_URL } from '../api-routes';
import { LastStoreUpdate, PlatformStoreUpdate } from '../models/ps2/admin.model';
import { Ps2Platform } from '../models/ps2/common.model';
import { aggregateByPlatform } from './aggregate';

/** Voidwell.DaybreakGames `StoreController` (`ps2/store`). Administrator only. */
@Injectable({ providedIn: 'root' })
export class StoreRepository {
    private api = inject(Ps2ApiClient);
    private readonly url = `${PS2_API_URL}/store`;

    /** Update logs of all three Daybreak instances, each tagged with its platform. */
    getUpdateLog(): Observable<PlatformStoreUpdate[]> {
        return aggregateByPlatform(platform =>
            this.api.get<LastStoreUpdate[]>(`${this.url}/updatelog`, { auth: true, platform }));
    }

    forceUpdate(storeName: string, platform: Ps2Platform): Observable<LastStoreUpdate> {
        return this.api.post<LastStoreUpdate>(`${this.url}/update/${storeName}`, null, { auth: true, platform });
    }
}
