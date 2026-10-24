import { Component, computed, input, signal } from '@angular/core';
import { DecimalPipe, NgClass, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { FactionColorPipe } from '../../../../pipes/faction-color.pipe';
import { TopOutfitRow, cellOf, sortRows } from '../activity-figures';

/** The most active outfits of the last hour, their names in their faction's colour. */
@Component({
    selector: 'activity-outfits-card',
    templateUrl: './activity-outfits-card.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, MatSort, MatSortHeader, RouterLink, NgClass, DecimalPipe, PercentPipe, FactionColorPipe]
})
export class ActivityOutfitsCardComponent {
    readonly outfits = input<TopOutfitRow[]>([]);

    readonly sort = signal<Sort>({ active: 'kills', direction: 'desc' });
    readonly rows = computed(() => sortRows(this.outfits(), this.sort(), cellOf));

    onSort(sort: Sort): void {
        this.sort.set(sort);
    }
}
