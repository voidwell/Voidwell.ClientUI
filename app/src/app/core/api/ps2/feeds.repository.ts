import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Ps2ApiClient } from './ps2-api-client';
import { PS2_API_URL } from '../api-routes';
import { FeedItem } from '../models/ps2/reference.model';

/** Voidwell.DaybreakGames `FeedsController` (`ps2/feeds`). */
@Injectable({ providedIn: 'root' })
export class FeedsRepository {
    private api = inject(Ps2ApiClient);
    private readonly url = `${PS2_API_URL}/feeds`;

    getNews(): Observable<FeedItem[]> {
        return this.api.get<FeedItem[]>(`${this.url}/news`, { platform: false });
    }

    getUpdates(): Observable<FeedItem[]> {
        return this.api.get<FeedItem[]>(`${this.url}/updates`, { platform: false });
    }
}
