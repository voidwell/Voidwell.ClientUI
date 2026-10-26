import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RankingsRepository } from '@core/api/ps2/rankings.repository';
import { RatingCharacter } from '@core/api/models/ps2/reference.model';
import { getErrorMessage } from '@core/util/error-message';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { cellOf, sortRows } from '../components/combat-report/combat-report-figures';
import { WorldService } from '../data/world.service';
import { FactionColorPipe } from '../pipes/faction-color.pipe';
import { PLAYER_RANKS_PAGE_SIZE, PlayerRankRow, playerRankRows } from './player-ranks-figures';

type Result = { players: RatingCharacter[] } | { error: string };

@Component({
    templateUrl: './player-ranks.component.html',
    styleUrls: ['./player-ranks.component.css'],
    imports: [MatCard, MatCardTitle, MatCardContent, MatIcon, MatSort, MatSortHeader, RouterLink, NgClass, DecimalPipe, LoaderComponent, ErrorCardComponent, FactionColorPipe]
})

export class PlayerRanksComponent {
    private worldService = inject(WorldService);

    readonly pageSize = PLAYER_RANKS_PAGE_SIZE;
    readonly search = signal('');
    readonly sort = signal<Sort>({ active: 'rating', direction: 'desc' });
    readonly page = signal(0);
    readonly expanded = signal<ReadonlySet<string>>(new Set());

    /** `null` until the ranks have loaded. */
    private readonly result = toSignal(
        inject(RankingsRepository).getPlayerRanks().pipe(
            map((players): Result => ({ players })),
            catchError(error => of<Result>({ error: getErrorMessage(error) }))),
        { initialValue: null as Result | null });

    readonly isLoading = computed(() => this.result() === null);
    readonly errorMessage = computed(() => {
        const result = this.result();
        return result && 'error' in result ? result.error || 'Error' : null;
    });

    private readonly rows = computed<PlayerRankRow[]>(() => {
        const result = this.result();
        return result && 'players' in result ? playerRankRows(result.players, this.worldService.worlds()) : [];
    });
    readonly total = computed(() => this.rows().length);

    private readonly filtered = computed(() => {
        const term = this.search().trim().toLowerCase();
        const rows = term ? this.rows().filter(row => row.name.toLowerCase().includes(term)) : this.rows();
        return sortRows(rows, this.sort(), cellOf);
    });
    readonly filteredCount = computed(() => this.filtered().length);
    readonly pageRows = computed(() => this.filtered().slice(this.page() * PLAYER_RANKS_PAGE_SIZE, (this.page() + 1) * PLAYER_RANKS_PAGE_SIZE));
    readonly firstRow = computed(() => (this.pageRows().length ? this.page() * PLAYER_RANKS_PAGE_SIZE + 1 : 0));
    readonly lastRow = computed(() => this.page() * PLAYER_RANKS_PAGE_SIZE + this.pageRows().length);
    readonly hasNext = computed(() => this.lastRow() < this.filteredCount());

    onSearch(value: string): void {
        this.search.set(value);
        this.page.set(0);
    }

    onSort(sort: Sort): void {
        this.sort.set(sort);
        this.page.set(0);
    }

    goToPage(page: number): void {
        this.page.set(page);
    }

    toggle(id: string): void {
        this.expanded.update(open => {
            const next = new Set(open);
            if (!next.delete(id)) {
                next.add(id);
            }
            return next;
        });
    }
}
