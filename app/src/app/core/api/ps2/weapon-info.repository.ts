import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ps2ApiClient } from './ps2-api-client';
import { PS2_API_URL } from '../api-routes';
import { WeaponInfoResult } from '../models/ps2/weapon.model';

/** Voidwell.DaybreakGames `WeaponInfoController` (`ps2/weaponInfo`). */
@Injectable({ providedIn: 'root' })
export class WeaponInfoRepository {
    private api = inject(Ps2ApiClient);
    private readonly url = `${PS2_API_URL}/weaponInfo`;

    getWeaponInfo(weaponItemId: number | string): Observable<WeaponInfoResult> {
        return this.api.get<WeaponInfoResult>(`${this.url}/${weaponItemId}`, { platform: false });
    }

    /** Requires the Mutterblack policy. */
    getWeaponInfoByName(weaponName: string): Observable<WeaponInfoResult> {
        return this.api.get<WeaponInfoResult>(`${this.url}/byname/${weaponName}`, { auth: true });
    }
}
