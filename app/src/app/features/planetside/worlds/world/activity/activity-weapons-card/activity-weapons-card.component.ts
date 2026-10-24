import { Component, computed, input, signal } from '@angular/core';
import { DecimalPipe, NgClass, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { CombatReportWeaponStats } from '@core/api/models/ps2/combat-report.model';
import { FactionColorPipe } from '../../../../pipes/faction-color.pipe';
import { cellOf, sortRows, weaponRows } from '../activity-figures';

/** The weapons with the most kills in the last hour, in the colour of the faction that uses each. */
@Component({
    selector: 'activity-weapons-card',
    templateUrl: './activity-weapons-card.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, MatSort, MatSortHeader, RouterLink, NgClass, DecimalPipe, PercentPipe, FactionColorPipe]
})
export class ActivityWeaponsCardComponent {
    readonly weapons = input<CombatReportWeaponStats[]>();

    readonly sort = signal<Sort>({ active: 'kills', direction: 'desc' });
    readonly rows = computed(() => sortRows(weaponRows(this.weapons()), this.sort(), cellOf));

    onSort(sort: Sort): void {
        this.sort.set(sort);
    }
}
