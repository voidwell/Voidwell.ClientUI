import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api-client';
import { DEADLOCK_API_URL } from '../api-routes';
import { DeadlockHero, DeadlockPatch, DeadlockRank } from '../models/deadlock/deadlock.model';

/** Voidwell.Deadlock `HeroController` (`deadlock/hero`). */
@Injectable({ providedIn: 'root' })
export class DeadlockHeroRepository {
    private api = inject(ApiClient);
    private readonly url = `${DEADLOCK_API_URL}/hero`;

    getHeroes(): Observable<DeadlockHero[]> {
        return this.api.get<DeadlockHero[]>(this.url, { cache: true });
    }

    getHero(heroId: number): Observable<DeadlockHero> {
        return this.api.get<DeadlockHero>(`${this.url}/${heroId}`, { cache: true });
    }
}

/** Voidwell.Deadlock `RankController` (`deadlock/rank`). */
@Injectable({ providedIn: 'root' })
export class DeadlockRankRepository {
    private api = inject(ApiClient);

    getRanks(): Observable<DeadlockRank[]> {
        return this.api.get<DeadlockRank[]>(`${DEADLOCK_API_URL}/rank`, { cache: true });
    }
}

/** Voidwell.Deadlock `PatchController` (`deadlock/patch`). */
@Injectable({ providedIn: 'root' })
export class DeadlockPatchRepository {
    private api = inject(ApiClient);

    /** Known patches, newest first. The date is what the analytics `patch` parameter takes. */
    getPatches(majorOnly = false): Observable<DeadlockPatch[]> {
        return this.api.get<DeadlockPatch[]>(`${DEADLOCK_API_URL}/patch`, { params: { majorOnly }, cache: true });
    }
}
