import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ps2ApiClient } from './ps2-api-client';
import { Ps2Platform } from '../models/ps2/common.model';
import { aggregateByPlatform } from './aggregate';
import { PS2_API_URL } from '../api-routes';
import { PlatformSearchResult, SearchResult } from '../models/ps2/reference.model';

/** How long to wait on one instance before showing the others' results without it. */
const SEARCH_TIMEOUT_MS = 5000;

/** Voidwell.DaybreakGames `SearchController` (`ps2/search`). */
@Injectable({ providedIn: 'root' })
export class SearchRepository {
    private api = inject(Ps2ApiClient);
    private readonly url = `${PS2_API_URL}/search`;

    /** Searches the given platform, or the selected one when omitted. */
    search(category: string, query: string, platform?: Ps2Platform): Observable<SearchResult[]> {
        return this.api.get<SearchResult[]>(`${this.url}/${category}/${query}`, { platform });
    }

    /** Searches all three Daybreak instances, each result tagged with its platform; one that is slow or down is left out. */
    searchAllPlatforms(category: string, query: string): Observable<PlatformSearchResult[]> {
        return aggregateByPlatform(platform => this.search(category, query, platform), SEARCH_TIMEOUT_MS);
    }
}
