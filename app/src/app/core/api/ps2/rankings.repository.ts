import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ps2ApiClient } from './ps2-api-client';
import { PS2_API_URL } from '../api-routes';
import { RatingCharacter } from '../models/ps2/reference.model';

/** Voidwell.DaybreakGames `RankingsController` (`ps2/ranks`). */
@Injectable({ providedIn: 'root' })
export class RankingsRepository {
    private api = inject(Ps2ApiClient);
    private readonly url = `${PS2_API_URL}/ranks`;

    /** The top 1000 rated players. */
    getPlayerRanks(): Observable<RatingCharacter[]> {
        return this.api.get<RatingCharacter[]>(this.url);
    }
}
