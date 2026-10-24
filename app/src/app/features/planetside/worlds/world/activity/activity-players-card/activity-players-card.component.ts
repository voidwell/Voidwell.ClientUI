import { Component, computed, input, signal } from '@angular/core';
import { DecimalPipe, NgClass, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { FactionColorPipe } from '../../../../pipes/faction-color.pipe';
import { TopPlayerRow, cellOf, sortRows } from '../../../../components/combat-report/combat-report-figures';

/** The most active players of the last hour, their names in their faction's colour. */
@Component({
    selector: 'activity-players-card',
    templateUrl: './activity-players-card.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, MatSort, MatSortHeader, RouterLink, NgClass, DecimalPipe, PercentPipe, FactionColorPipe]
})
export class ActivityPlayersCardComponent {
    readonly players = input<TopPlayerRow[]>([]);

    readonly sort = signal<Sort>({ active: 'kills', direction: 'desc' });
    readonly rows = computed(() => sortRows(this.players(), this.sort(), cellOf));

    onSort(sort: Sort): void {
        this.sort.set(sort);
    }
}
