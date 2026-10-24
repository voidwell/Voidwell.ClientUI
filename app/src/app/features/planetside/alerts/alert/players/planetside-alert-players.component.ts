import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe, NgClass, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { PlanetsideCombatEventComponent } from '../../../components/combat-event/planetside-combat-event.component';
import { cellOf, combatPlayerRows, sortRows } from '../../../components/combat-report/combat-report-figures';
import { FactionColorPipe } from '../../../pipes/faction-color.pipe';

/** The players table's rows per page. */
export const ALERT_PLAYERS_PAGE_SIZE = 25;

/** The players of an alert or event by their figures, their names in their faction's colour. */
@Component({
    templateUrl: './planetside-alert-players.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, MatIcon, MatSort, MatSortHeader, RouterLink, NgClass, DecimalPipe, PercentPipe, FactionColorPipe]
})
export class PlanetsideAlertPlayersComponent {
    private parentEventComponent = inject(PlanetsideCombatEventComponent);

    readonly pageSize = ALERT_PLAYERS_PAGE_SIZE;
    readonly search = signal('');
    readonly sort = signal<Sort>({ active: 'kills', direction: 'desc' });
    readonly page = signal(0);

    private readonly rows = computed(() => combatPlayerRows(this.parentEventComponent.event()?.log?.stats?.participants));
    readonly total = computed(() => this.rows().length);

    private readonly filtered = computed(() => {
        const term = this.search().trim().toLowerCase();
        const rows = term ? this.rows().filter(row => row.name.toLowerCase().includes(term)) : this.rows();
        return sortRows(rows, this.sort(), cellOf);
    });
    readonly filteredCount = computed(() => this.filtered().length);
    readonly pageRows = computed(() => this.filtered().slice(this.page() * ALERT_PLAYERS_PAGE_SIZE, (this.page() + 1) * ALERT_PLAYERS_PAGE_SIZE));
    readonly firstRow = computed(() => this.page() * ALERT_PLAYERS_PAGE_SIZE + 1);
    readonly lastRow = computed(() => this.page() * ALERT_PLAYERS_PAGE_SIZE + this.pageRows().length);
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
}
