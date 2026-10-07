import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ps2ApiClient } from './ps2-api-client';
import { PS2_API_URL } from '../api-routes';
import { CombatReport, CombatReportRequest } from '../models/ps2/combat-report.model';

/** Voidwell.DaybreakGames `CombatReportController` (`ps2/combatReport`). */
@Injectable({ providedIn: 'root' })
export class CombatReportRepository {
    private api = inject(Ps2ApiClient);
    private readonly url = `${PS2_API_URL}/combatReport`;

    getCombatReport(request: CombatReportRequest): Observable<CombatReport> {
        return this.api.post<CombatReport, CombatReportRequest>(this.url, request);
    }
}
