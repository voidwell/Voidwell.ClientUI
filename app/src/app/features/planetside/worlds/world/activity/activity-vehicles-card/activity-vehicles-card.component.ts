import { Component, computed, input, signal } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { CombatReportVehicleStats } from '@core/api/models/ps2/combat-report.model';
import { FactionColorPipe } from '../../../../pipes/faction-color.pipe';
import { cellOf, sortRows, vehicleRows } from '../activity-figures';

/** The vehicles with the most kills in the last hour, in the colour of the faction that flies or drives each. */
@Component({
    selector: 'activity-vehicles-card',
    templateUrl: './activity-vehicles-card.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, MatSort, MatSortHeader, NgClass, DecimalPipe, FactionColorPipe]
})
export class ActivityVehiclesCardComponent {
    readonly vehicles = input<CombatReportVehicleStats[]>();

    readonly sort = signal<Sort>({ active: 'kills', direction: 'desc' });
    readonly rows = computed(() => sortRows(vehicleRows(this.vehicles()), this.sort(), cellOf));

    onSort(sort: Sort): void {
        this.sort.set(sort);
    }
}
