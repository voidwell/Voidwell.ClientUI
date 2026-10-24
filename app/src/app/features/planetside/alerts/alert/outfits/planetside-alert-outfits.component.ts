import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe, NgClass, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { PlanetsideCombatEventComponent } from '../../../components/combat-event/planetside-combat-event.component';
import { cellOf, combatOutfitRows, sortRows } from '../../../components/combat-report/combat-report-figures';
import { FactionColorPipe } from '../../../pipes/faction-color.pipe';

/** The outfits of an alert or event by their figures, their names in their faction's colour. */
@Component({
    templateUrl: './planetside-alert-outfits.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, MatSort, MatSortHeader, RouterLink, NgClass, DecimalPipe, PercentPipe, FactionColorPipe]
})
export class PlanetsideAlertOutfitsComponent {
    private parentEventComponent = inject(PlanetsideCombatEventComponent);

    readonly sort = signal<Sort>({ active: 'kills', direction: 'desc' });
    readonly rows = computed(() => sortRows(combatOutfitRows(this.parentEventComponent.event()?.log?.stats?.outfits), this.sort(), cellOf));

    onSort(sort: Sort): void {
        this.sort.set(sort);
    }
}
