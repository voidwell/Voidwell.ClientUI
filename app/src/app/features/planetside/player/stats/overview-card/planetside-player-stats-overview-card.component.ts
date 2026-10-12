import { Component, input } from '@angular/core';
import { CharacterDetails } from '@core/api/models/ps2/character.model';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { DecimalPipe, DatePipe } from '@angular/common';

@Component({
    selector: 'planetside-player-stats-overview-card',
    templateUrl: './planetside-player-stats-overview-card.component.html',
    styleUrls: ['./planetside-player-stats-overview-card.component.css'],
    imports: [MatCard, MatCardTitle, MatCardContent, MatIcon, DecimalPipe, DatePipe]
})

export class PlanetsidePlayerStatsOverviewCardComponent {
    readonly player = input.required<CharacterDetails>();
}
