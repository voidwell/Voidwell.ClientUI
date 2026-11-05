import { Component, computed, input, signal } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { ChipsComponent } from '@shared/ui/vw-chips/vw-chips.component';
import { CombatOutfitRow } from '../../../../components/combat-report/combat-report-figures';
import { FactionColorPipe } from '../../../../pipes/faction-color.pipe';
import { FACTION_FILTER_OPTIONS, FactionFilter, topRanked } from '../faction-filter';

/** The ten outfits with the most facility captures in an alert or event, narrowed to one empire if wished, linking on to all of them. */
@Component({
    selector: 'alert-top-outfits-card',
    templateUrl: './alert-top-outfits-card.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, ChipsComponent, RouterLink, NgClass, DecimalPipe, FactionColorPipe]
})
export class AlertTopOutfitsCardComponent {
    readonly outfits = input<readonly CombatOutfitRow[]>([]);

    readonly factionOptions = FACTION_FILTER_OPTIONS;
    readonly faction = signal<FactionFilter>(null);
    readonly rows = computed(() => topRanked(this.outfits(), this.faction(), row => row.captures));
}
