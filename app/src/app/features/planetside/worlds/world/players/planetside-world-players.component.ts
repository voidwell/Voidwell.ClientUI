import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { OnlineCharacter } from '@core/api/models/ps2/character.model';
import { getErrorMessage } from '@core/util/error-message';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ZoneService } from '../../../data/zone.service';
import { FactionCodePipe } from '../../../pipes/faction-code.pipe';
import { FactionColorPipe } from '../../../pipes/faction-color.pipe';
import { cellOf, sortRows } from '../../../components/combat-report/combat-report-figures';
import { PlanetsideWorldComponent } from '../planetside-world.component';
import { agoLabel } from '../world-figures';
import { ALL_FACTIONS, PLAYERS_PAGE_SIZE, filterPlayers, onlinePlayerRows, playerCounts } from './online-players-figures';

type Result = { players: OnlineCharacter[] } | { error: string };

@Component({
    templateUrl: './planetside-world-players.component.html',
    imports: [
        MatCard, MatCardTitle, MatCardContent, MatIcon, MatSort, MatSortHeader, RouterLink, NgClass, DecimalPipe, DatePipe,
        LoaderComponent, ErrorCardComponent, FactionCodePipe, FactionColorPipe
    ]
})
export class PlanetsideWorldPlayersComponent {
    private parent = inject(PlanetsideWorldComponent);
    private zoneService = inject(ZoneService);

    readonly agoLabel = agoLabel;
    /** Everyone, then VS, NC, TR and NS. */
    readonly factions = [ALL_FACTIONS, 1, 2, 3, 4];

    private readonly result = signal<Result | null>(null);
    readonly faction = signal(ALL_FACTIONS);
    readonly search = signal('');
    readonly sort = signal<Sort>({ active: 'onlineMinutes', direction: 'desc' });
    readonly page = signal(0);

    readonly isLoading = computed(() => this.result() === null);
    readonly failed = computed(() => {
        const result = this.result();
        return !!result && 'error' in result;
    });

    private readonly rows = computed(() => {
        const result = this.result();
        return result && 'players' in result
            ? onlinePlayerRows(result.players, id => this.zoneService.zoneName(id))
            : [];
    });
    readonly counts = computed(() => playerCounts(this.rows()));

    private readonly filtered = computed(() => sortRows(filterPlayers(this.rows(), this.faction(), this.search()), this.sort(), cellOf));
    readonly filteredCount = computed(() => this.filtered().length);
    readonly pageRows = computed(() => this.filtered().slice(this.page() * PLAYERS_PAGE_SIZE, (this.page() + 1) * PLAYERS_PAGE_SIZE));
    readonly firstRow = computed(() => this.page() * PLAYERS_PAGE_SIZE + 1);
    readonly lastRow = computed(() => this.page() * PLAYERS_PAGE_SIZE + this.pageRows().length);
    readonly hasNext = computed(() => this.lastRow() < this.filteredCount());

    constructor() {
        this.parent.getOnlinePlayers()
            .pipe(catchError(error => of({ error: getErrorMessage(error) })))
            .subscribe(players => this.result.set(Array.isArray(players) ? { players } : players));
    }

    setFaction(factionId: number): void {
        this.faction.set(factionId);
        this.page.set(0);
    }

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
}
