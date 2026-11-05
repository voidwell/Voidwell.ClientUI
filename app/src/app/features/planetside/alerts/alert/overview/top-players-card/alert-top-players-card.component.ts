import { Component, computed, input, signal } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { ChipsComponent } from '@shared/ui/vw-chips/vw-chips.component';
import { CombatPlayerRow } from '../../../../components/combat-report/combat-report-figures';
import { FactionColorPipe } from '../../../../pipes/faction-color.pipe';
import { FACTION_FILTER_OPTIONS, FactionFilter, topRanked } from '../faction-filter';

/** The ten players with the most kills in an alert or event, best first, narrowed to one empire if wished, linking on to all of them. */
@Component({
    selector: 'alert-top-players-card',
    templateUrl: './alert-top-players-card.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, ChipsComponent, RouterLink, NgClass, DecimalPipe, FactionColorPipe]
})
export class AlertTopPlayersCardComponent {
    readonly players = input<readonly CombatPlayerRow[]>([]);

    readonly factionOptions = FACTION_FILTER_OPTIONS;
    readonly faction = signal<FactionFilter>(null);
    readonly rows = computed(() => topRanked(this.players(), this.faction(), row => row.kills));
}
