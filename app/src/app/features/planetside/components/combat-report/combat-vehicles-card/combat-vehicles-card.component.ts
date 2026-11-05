import { Component, computed, input, signal } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { CombatReportVehicleStats } from '@core/api/models/ps2/combat-report.model';
import { FactionColorPipe } from '../../../pipes/faction-color.pipe';
import { cellOf, sortRows, vehicleRows } from '../combat-report-figures';

/** Vehicles by their kills, in the colour of the faction that flies or drives each. The caption names the period, if any. */
@Component({
    selector: 'combat-vehicles-card',
    templateUrl: './combat-vehicles-card.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, MatSort, MatSortHeader, RouterLink, NgClass, DecimalPipe, FactionColorPipe]
})
export class CombatVehiclesCardComponent {
    readonly vehicles = input<CombatReportVehicleStats[]>();
    readonly caption = input('');
    /** Shows only this many of the top rows by kills, when set. */
    /** The card's title. */
    readonly heading = input('Vehicles');
    /** Whether the column headers sort the table. */
    readonly sortable = input(true);
    readonly limit = input<number | null>(null);
    /** Where the full list is, shown as a "View All" link when set. */
    readonly viewAll = input<string | readonly string[] | null>(null);

    readonly sort = signal<Sort>({ active: 'kills', direction: 'desc' });
    readonly rows = computed(() => {
        const limit = this.limit();
        const all = vehicleRows(this.vehicles());
        return sortRows(limit === null ? all : sortRows(all, { active: 'kills', direction: 'desc' }, cellOf).slice(0, limit), this.sort(), cellOf);
    });

    onSort(sort: Sort): void {
        this.sort.set(sort);
    }
}
