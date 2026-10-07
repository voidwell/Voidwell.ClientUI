import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ps2ApiClient } from './ps2-api-client';
import { PS2_API_URL } from '../api-routes';
import { LeaderboardSortDirection, WeaponLeaderboardRow } from '../models/ps2/weapon.model';

/** Voidwell.DaybreakGames `LeaderboardController` (`ps2/leaderboard`). */
@Injectable({ providedIn: 'root' })
export class LeaderboardRepository {
    private api = inject(Ps2ApiClient);
    private readonly url = `${PS2_API_URL}/leaderboard`;

    getWeaponLeaderboard(
        weaponItemId: number | string,
        page = 0,
        sort = 'kills',
        sortDir: LeaderboardSortDirection | '' = 'desc'
    ): Observable<WeaponLeaderboardRow[]> {
        return this.api.get<WeaponLeaderboardRow[]>(`${this.url}/weapon/${weaponItemId}`, {
            params: { page, sort, sortDir: sortDir || undefined }
        });
    }
}
