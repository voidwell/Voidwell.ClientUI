import { Component, computed, input, signal } from '@angular/core';
import { DecimalPipe, NgClass, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { CombatReportWeaponStats } from '@core/api/models/ps2/combat-report.model';
import { FactionColorPipe } from '../../../pipes/faction-color.pipe';
import { cellOf, sortRows, weaponRows } from '../combat-report-figures';

/** Weapons by their kills, in the colour of the faction that uses each. The caption names the period, if any. */
@Component({
    selector: 'combat-weapons-card',
    templateUrl: './combat-weapons-card.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, MatSort, MatSortHeader, RouterLink, NgClass, DecimalPipe, PercentPipe, FactionColorPipe]
})
export class CombatWeaponsCardComponent {
    readonly weapons = input<CombatReportWeaponStats[]>();
    readonly caption = input('');

    readonly sort = signal<Sort>({ active: 'kills', direction: 'desc' });
    readonly rows = computed(() => sortRows(weaponRows(this.weapons()), this.sort(), cellOf));

    onSort(sort: Sort): void {
        this.sort.set(sort);
    }
}
