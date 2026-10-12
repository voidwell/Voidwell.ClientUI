import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { Ps2ApiClient } from './ps2-api-client';
import { PS2_API_URL } from '../api-routes';
import { Profile } from '../models/ps2/reference.model';

/** Voidwell.DaybreakGames `ProfileController` (`ps2/profile`). */
@Injectable({ providedIn: 'root' })
export class ProfileRepository {
    private api = inject(Ps2ApiClient);
    private readonly url = `${PS2_API_URL}/profile`;

    /**
     * All character classes. The class list is reference data, so the request is made once and its
     * response replayed to every subscriber, including ones that arrive while it is still in flight.
     * A failed request is not kept, so the next subscriber tries again.
     */
    private readonly profiles$ = this.api.get<Profile[]>(this.url, { platform: false }).pipe(
        shareReplay({ bufferSize: 1, refCount: false }));

    getProfiles(): Observable<Profile[]> {
        return this.profiles$;
    }
}
