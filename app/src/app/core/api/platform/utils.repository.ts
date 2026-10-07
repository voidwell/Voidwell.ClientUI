import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api-client';
import { PLATFORM_API_URL } from '../api-routes';

/** Voidwell.Platform `UtilsController` (`platform/utils`). */
@Injectable({ providedIn: 'root' })
export class UtilsRepository {
    private api = inject(ApiClient);
    private readonly url = `${PLATFORM_API_URL}/utils`;

    /** Current server time as an ISO 8601 UTC timestamp. */
    getServerTime(): Observable<string> {
        return this.api.get<string>(`${this.url}/time`);
    }
}
