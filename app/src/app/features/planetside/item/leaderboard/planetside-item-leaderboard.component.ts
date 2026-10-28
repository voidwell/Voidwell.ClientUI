import { Component, computed, effect, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { MatIcon } from '@angular/material/icon';
import { combineLatest, of } from 'rxjs';
import { catchError, filter, map, startWith, switchMap } from 'rxjs/operators';
import { LeaderboardSortDirection, WeaponLeaderboardRow } from '@core/api/models/ps2/weapon.model';
import { LeaderboardRepository } from '@core/api/ps2/leaderboard.repository';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { GradedFigureComponent } from '../../components/graded-figure/graded-figure.component';
import { FactionIconComponent } from '../../components/faction-icon/faction-icon.component';
import { PlanetsideItemComponent } from '../planetside-item.component';
import { LEADERBOARD_PAGE_SIZE, accuracy, hours, hsr, kdr, kph } from '../leaderboard-figures';

/** The API serves the top 1,000 players. */
const MAX_RANK = 1000;

type LeaderboardResult = { rows: WeaponLeaderboardRow[] } | { error: true };

/** The weapon's players by kills or any other sortable figure, a page at a time; sorting happens on the server. */
@Component({
    templateUrl: './planetside-item-leaderboard.component.html',
    styleUrls: ['./planetside-item-leaderboard.component.css'],
    imports: [
        MatCard, MatCardTitle, MatCardContent, MatSort, MatSortHeader, MatIcon, RouterLink, DecimalPipe, PercentPipe,
        LoaderComponent, GradedFigureComponent, FactionIconComponent
    ]
})
export class PlanetsideItemLeaderboardComponent {
    private itemComponent = inject(PlanetsideItemComponent);
    private leaderboardRepository = inject(LeaderboardRepository);

    readonly pageSize = LEADERBOARD_PAGE_SIZE;

    readonly kdr = kdr;
    readonly accuracy = accuracy;
    readonly hsr = hsr;
    readonly kph = kph;
    readonly hours = hours;

    readonly page = signal(0);
    readonly sort = signal<Sort>({ active: 'kills', direction: 'desc' });
    /** The player whose row is open on small screens, by character id. */
    readonly expanded = signal<string | null>(null);

    private readonly result = toSignal(combineLatest([toObservable(this.itemComponent.itemId), toObservable(this.page), toObservable(this.sort)]).pipe(
        filter((args): args is [string, number, Sort] => !!args[0]),
        switchMap(([id, page, sort]) => this.leaderboardRepository.getWeaponLeaderboard(id, page, sort.active, sort.direction as LeaderboardSortDirection).pipe(
            map((rows): LeaderboardResult => ({ rows })),
            catchError(() => of<LeaderboardResult>({ error: true })),
            startWith(undefined)))));

    readonly loading = computed(() => this.result() === undefined);
    readonly failed = computed(() => {
        const result = this.result();
        return !!result && 'error' in result;
    });

    /** The rows of the current page; the last page loaded stays up while the next one loads. */
    private readonly lastRows = signal<WeaponLeaderboardRow[]>([]);
    readonly rows = this.lastRows.asReadonly();

    readonly firstRank = computed(() => this.page() * this.pageSize + 1);
    readonly lastRank = computed(() => this.page() * this.pageSize + this.rows().length);
    readonly hasNext = computed(() => this.rows().length === this.pageSize && (this.page() + 1) * this.pageSize < MAX_RANK);

    constructor() {
        effect(() => {
            const result = this.result();
            if (result && 'rows' in result) {
                this.lastRows.set(result.rows);
            } else if (result) {
                this.lastRows.set([]);
            }
        });

        effect(() => {
            this.itemComponent.breadcrumbs.set([
                { label: 'Overview', link: `/ps2/item/${this.itemComponent.itemId()}/stats` },
                { label: 'Leaderboard' }
            ]);
        });
    }

    onSort(sort: Sort): void {
        this.sort.set(sort);
        this.page.set(0);
        this.expanded.set(null);
    }

    goToPage(page: number): void {
        this.page.set(page);
        this.expanded.set(null);
    }

    toggle(row: WeaponLeaderboardRow): void {
        this.expanded.update(id => (id === row.characterId ? null : row.characterId ?? null));
    }
}
