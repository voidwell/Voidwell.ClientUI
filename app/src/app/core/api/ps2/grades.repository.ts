import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ps2ApiClient } from './ps2-api-client';
import { PS2_API_URL } from '../api-routes';
import { StatGrade } from '../models/ps2/reference.model';

/** Voidwell.DaybreakGames `GradesController` (`ps2/grades`). */
@Injectable({ providedIn: 'root' })
export class GradesRepository {
    private api = inject(Ps2ApiClient);
    private readonly url = `${PS2_API_URL}/grades`;

    /** Static reference data, cached after the first request. */
    getGrades(): Observable<StatGrade[]> {
        return this.api.get<StatGrade[]>(this.url, { cache: true, platform: false });
    }
}
