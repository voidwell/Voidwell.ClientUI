import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ps2ApiClient } from './ps2-api-client';
import { PS2_API_URL } from '../api-routes';
import { SearchResult } from '../models/ps2/reference.model';

/** Voidwell.DaybreakGames `SearchController` (`ps2/search`). */
@Injectable({ providedIn: 'root' })
export class SearchRepository {
    private api = inject(Ps2ApiClient);
    private readonly url = `${PS2_API_URL}/search`;

    search(category: string, query: string): Observable<SearchResult[]> {
        return this.api.get<SearchResult[]>(`${this.url}/${category}/${query}`);
    }
}
