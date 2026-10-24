import { Component, computed, input } from '@angular/core';
import { DecimalPipe, NgClass, PercentPipe } from '@angular/common';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { WorldActivityStats } from '@core/api/models/ps2/world.model';
import { FactionCodePipe } from '../../../../pipes/faction-code.pipe';
import { FactionColorPipe } from '../../../../pipes/faction-color.pipe';
import { FACTION_KEYS, FactionKey } from '../../../world-list-figures';
import { factionStatRows } from '../activity-figures';

/** The factions side by side on each figure of the last hour. */
@Component({
    selector: 'activity-factions-card',
    templateUrl: './activity-factions-card.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, NgClass, DecimalPipe, PercentPipe, FactionCodePipe, FactionColorPipe]
})
export class ActivityFactionsCardComponent {
    readonly stats = input<WorldActivityStats>();

    readonly rows = computed(() => factionStatRows(this.stats()));
    readonly factions: { key: FactionKey; id: number }[] = FACTION_KEYS.map((key, index) => ({ key, id: index + 1 }));
}
