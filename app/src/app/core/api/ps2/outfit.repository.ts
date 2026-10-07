import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ps2ApiClient } from './ps2-api-client';
import { PS2_API_URL } from '../api-routes';
import { OutfitDetails, OutfitMemberDetails } from '../models/ps2/outfit.model';

/** Voidwell.DaybreakGames `OutfitController` (`ps2/outfit`). */
@Injectable({ providedIn: 'root' })
export class OutfitRepository {
    private api = inject(Ps2ApiClient);
    private readonly url = `${PS2_API_URL}/outfit`;

    getOutfit(outfitId: string): Observable<OutfitDetails> {
        return this.api.get<OutfitDetails>(`${this.url}/${outfitId}`);
    }

    getMembers(outfitId: string): Observable<OutfitMemberDetails[]> {
        return this.api.get<OutfitMemberDetails[]>(`${this.url}/${outfitId}/members`);
    }

    /** Requires the Mutterblack policy. */
    getOutfitByAlias(outfitAlias: string): Observable<OutfitDetails> {
        return this.api.get<OutfitDetails>(`${this.url}/byalias/${outfitAlias}`, { auth: true });
    }
}
