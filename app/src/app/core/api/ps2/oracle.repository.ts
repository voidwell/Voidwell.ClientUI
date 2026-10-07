import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ps2ApiClient } from './ps2-api-client';
import { PS2_API_URL } from '../api-routes';
import { OracleStatsByWeapon, SimpleItem } from '../models/ps2/weapon.model';

/** Voidwell.DaybreakGames `OracleController` (`ps2/oracle`). */
@Injectable({ providedIn: 'root' })
export class OracleRepository {
    private api = inject(Ps2ApiClient);
    private readonly url = `${PS2_API_URL}/oracle`;

    /** Weapons in a category (or `all`), cached after the first request. */
    getCategoryWeapons(categoryId: string): Observable<SimpleItem[]> {
        return this.api.get<SimpleItem[]>(`${this.url}/category/${categoryId}`, { cache: true });
    }

    /** Daily values of one stat for each requested weapon, keyed by weapon item id. */
    getStats(statId: string, weaponIds: number[]): Observable<OracleStatsByWeapon> {
        return this.api.get<OracleStatsByWeapon>(`${this.url}/stats/${statId}`, { params: { q: weaponIds.join(',') } });
    }
}
