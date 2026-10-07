import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ps2ApiClient } from './ps2-api-client';
import { PS2_API_URL } from '../api-routes';
import { Profile } from '../models/ps2/reference.model';

/** Voidwell.DaybreakGames `ProfileController` (`ps2/profile`). */
@Injectable({ providedIn: 'root' })
export class ProfileRepository {
    private api = inject(Ps2ApiClient);
    private readonly url = `${PS2_API_URL}/profile`;

    /** All character classes, cached after the first request. */
    getProfiles(): Observable<Profile[]> {
        return this.api.get<Profile[]>(this.url, { cache: true, platform: false });
    }
}
