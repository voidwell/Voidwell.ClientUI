import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ps2ApiClient } from './ps2-api-client';
import { PS2_API_URL } from '../api-routes';
import { ServiceState, PlatformServiceState } from '../models/ps2/admin.model';
import { Ps2Platform } from '../models/ps2/common.model';
import { aggregateByPlatform } from './aggregate';

/** Voidwell.DaybreakGames `ServicesController` (`ps2/services`). Administrator only. */
@Injectable({ providedIn: 'root' })
export class ServicesRepository {
    private api = inject(Ps2ApiClient);
    private readonly url = `${PS2_API_URL}/services`;

    /** Service states of all three Daybreak instances, each tagged with its platform. */
    getAllStatuses(): Observable<PlatformServiceState[]> {
        return aggregateByPlatform(platform =>
            this.api.get<ServiceState[]>(`${this.url}/status`, { auth: true, platform }));
    }

    getStatus(serviceName: string, platform: Ps2Platform): Observable<ServiceState> {
        return this.api.get<ServiceState>(`${this.url}/${serviceName}/status`, { auth: true, platform });
    }

    enable(serviceName: string, platform: Ps2Platform): Observable<ServiceState> {
        return this.api.post<ServiceState>(`${this.url}/${serviceName}/enable`, null, { auth: true, platform });
    }

    disable(serviceName: string, platform: Ps2Platform): Observable<ServiceState> {
        return this.api.post<ServiceState>(`${this.url}/${serviceName}/disable`, null, { auth: true, platform });
    }
}
