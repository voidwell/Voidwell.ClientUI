import { Component, computed, input, signal } from '@angular/core';
import { DecimalPipe, NgClass, PercentPipe } from '@angular/common';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { CombatReportClassStats } from '@core/api/models/ps2/combat-report.model';
import { FactionCodePipe } from '../../../../pipes/faction-code.pipe';
import { FactionColorPipe } from '../../../../pipes/faction-color.pipe';
import { cellOf, classRows, sortRows } from '../activity-figures';

/** The classes of one faction at a time, by their figures of the last hour. */
@Component({
    selector: 'activity-classes-card',
    templateUrl: './activity-classes-card.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, MatSort, MatSortHeader, NgClass, DecimalPipe, PercentPipe, FactionCodePipe, FactionColorPipe]
})
export class ActivityClassesCardComponent {
    readonly classes = input<CombatReportClassStats[]>();

    /** The faction ids VS, NC and TR, which have classes of their own. */
    readonly factions = [1, 2, 3];
    readonly faction = signal(1);
    readonly sort = signal<Sort>({ active: 'kills', direction: 'desc' });

    readonly rows = computed(() => sortRows(
        classRows(this.classes()).filter(row => row.factionId === this.faction()), this.sort(), cellOf));

    onSort(sort: Sort): void {
        this.sort.set(sort);
    }
}
