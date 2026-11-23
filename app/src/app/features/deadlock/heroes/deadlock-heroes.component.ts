import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe, NgClass, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HeroAnalyticsRepository } from '@core/api/deadlock/hero-analytics.repository';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { changeClass, formatPercent, formatPoints, sortRows } from '../data/deadlock-figures';
import { deadlockResource } from '../data/deadlock-resource';
import { HeroRow, heroRows, heroSortValue } from './heroes-figures';

/** Above this many heroes the table offers a filter by name. */
const SEARCH_FROM = 12;

@Component({
    templateUrl: './deadlock-heroes.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, MatIcon, MatSort, MatSortHeader, RouterLink, NgClass, DecimalPipe, PercentPipe, LoaderComponent, ErrorCardComponent]
})
export class DeadlockHeroesComponent {
    private readonly repository = inject(HeroAnalyticsRepository);

    /** The heroes with their tier and trend; the tier list and the trend are left out when they cannot be worked out. */
    readonly heroes = deadlockResource((query) => forkJoin({
        stats: this.repository.getHeroStats(query),
        tiers: this.repository.getTierList(query).pipe(catchError(() => of(null))),
        trends: this.repository.getTrends(query).pipe(catchError(() => of(null)))
    }).pipe(map(({ stats, tiers, trends }) => ({ matches: stats.matches, rows: heroRows(stats, tiers, trends) }))));

    readonly search = signal('');
    readonly sort = signal<Sort>({ active: 'winRate', direction: 'desc' });
    readonly expanded = signal<ReadonlySet<number>>(new Set());

    readonly searchable = computed(() => (this.heroes.value()?.rows.length ?? 0) > SEARCH_FROM);

    readonly rows = computed<HeroRow[]>(() => {
        const term = this.search().trim().toLowerCase();
        const rows = this.heroes.value()?.rows ?? [];
        return sortRows(term ? rows.filter(row => row.name.toLowerCase().includes(term)) : rows, this.sort(), heroSortValue);
    });

    readonly formatPoints = formatPoints;
    readonly formatPercent = formatPercent;
    readonly changeClass = changeClass;

    toggle(id: number): void {
        this.expanded.update(open => {
            const next = new Set(open);
            if (!next.delete(id)) {
                next.add(id);
            }
            return next;
        });
    }
}
