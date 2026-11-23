import { Injectable, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DeadlockHeroRepository } from '@core/api/deadlock/deadlock-reference.repository';
import { HeroAnalyticsRepository } from '@core/api/deadlock/hero-analytics.repository';
import { deadlockResource } from '../data/deadlock-resource';

/** The hero a page of the hero area is about, and what every page of it shows first. Provided by the hero page. */
@Injectable()
export class DeadlockHeroContext {
    private readonly analytics = inject(HeroAnalyticsRepository);
    private readonly reference = inject(DeadlockHeroRepository);

    /** `undefined` until the route has been read, and while it is not a hero id. */
    readonly heroId = signal<number | undefined>(undefined);

    /** The hero's results, daily trend and results by rank tier. */
    readonly detail = deadlockResource((query, id: number) => this.analytics.getHero(id, query), () => this.heroId());

    /** The hero's reference data (picture, archetype); a hero without any still has its figures. */
    readonly info = rxResource({
        params: () => this.heroId(),
        stream: ({ params }) => this.reference.getHero(params).pipe(catchError(() => of(null)))
    });
}
