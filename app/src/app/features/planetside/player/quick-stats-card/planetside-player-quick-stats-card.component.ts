import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { CharacterDetails } from '@core/api/models/ps2/character.model';
import { LoaderComponent } from '@shared/ui/loader/loader.component';

@Component({
    selector: 'planetside-player-quick-stats-card',
    templateUrl: './planetside-player-quick-stats-card.component.html',
    styleUrls: ['./planetside-player-quick-stats-card.component.css'],
    imports: [LoaderComponent, MatCard, MatCardTitle, MatCardContent, MatIcon, DecimalPipe]
})

export class PlanetsidePlayerQuickStatsCardComponent {
    readonly player = input<CharacterDetails | null>(null);
}
