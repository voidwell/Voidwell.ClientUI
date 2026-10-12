import { Component, input } from '@angular/core';
import { CharacterDetailsLifetimeStats } from '@core/api/models/ps2/character.model';
import { MatCard, MatCardTitle, MatCardContent, MatCardFooter } from '@angular/material/card';
import { NgClass, DecimalPipe } from '@angular/common';

@Component({
    selector: 'planetside-player-stats-kdr-card',
    templateUrl: './planetside-player-stats-kdr-card.component.html',
    styleUrls: ['./planetside-player-stats-kdr-card.component.css'],
    imports: [MatCard, MatCardTitle, MatCardContent, MatCardFooter, NgClass, DecimalPipe]
})

export class PlanetsidePlayerStatsKdrCardComponent {
    readonly stats = input.required<CharacterDetailsLifetimeStats>();
}
