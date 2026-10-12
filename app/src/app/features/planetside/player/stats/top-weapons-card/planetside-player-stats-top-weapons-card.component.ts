import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { CharacterDetails } from '@core/api/models/ps2/character.model';
import { DgcImageUrlPipe } from '../../../pipes/dgc-image-url.pipe';

const ROW_COUNT = 5;

@Component({
    selector: 'planetside-player-stats-top-weapons-card',
    templateUrl: './planetside-player-stats-top-weapons-card.component.html',
    styleUrls: ['./planetside-player-stats-top-weapons-card.component.css'],
    imports: [MatCard, MatCardTitle, MatCardContent, RouterLink, DecimalPipe, DgcImageUrlPipe]
})

export class PlanetsidePlayerStatsTopWeaponsCardComponent {
    readonly player = input.required<CharacterDetails>();

    /** The player's most-used weapons by kills, as the weapons page sorts them by default. */
    readonly weapons = computed(() => (this.player().weaponStats ?? [])
        .filter(weapon => weapon.stats?.kills > 0)
        .sort((a, b) => b.stats.kills - a.stats.kills)
        .slice(0, ROW_COUNT));

    hideImage(event: Event): void {
        (event.target as HTMLElement).style.visibility = 'hidden';
    }
}
