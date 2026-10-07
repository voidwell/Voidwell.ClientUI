import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ps2ApiClient } from './ps2-api-client';
import { PS2_API_URL } from '../api-routes';
import { CharacterLastSession } from '../models/ps2/admin.model';

/** Voidwell.DaybreakGames `PSBUtilityController` (`ps2/psb`). Administrator or PSB only. */
@Injectable({ providedIn: 'root' })
export class PsbUtilityRepository {
    private api = inject(Ps2ApiClient);
    private readonly url = `${PS2_API_URL}/psb`;

    getLastOnlineSessions(): Observable<CharacterLastSession[]> {
        return this.api.get<CharacterLastSession[]>(`${this.url}/sessions`, { auth: true, platform: false });
    }
}
