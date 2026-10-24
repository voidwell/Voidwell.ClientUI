import { Component, computed, input, signal } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { CombatReportVehicleStats } from '@core/api/models/ps2/combat-report.model';
import { FactionColorPipe } from '../../../pipes/faction-color.pipe';
import { cellOf, sortRows, vehicleRows } from '../combat-report-figures';

/** Vehicles by their kills, in the colour of the faction that flies or drives each. The caption names the period, if any. */
@Component({
    selector: 'combat-vehicles-card',
    templateUrl: './combat-vehicles-card.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, MatSort, MatSortHeader, NgClass, DecimalPipe, FactionColorPipe]
})
export class CombatVehiclesCardComponent {
    readonly vehicles = input<CombatReportVehicleStats[]>();
    readonly caption = input('');

    readonly sort = signal<Sort>({ active: 'kills', direction: 'desc' });
    readonly rows = computed(() => sortRows(vehicleRows(this.vehicles()), this.sort(), cellOf));

    onSort(sort: Sort): void {
        this.sort.set(sort);
    }
}
