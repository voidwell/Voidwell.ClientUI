import { Component, input } from '@angular/core';
import { CharacterDetailsLifetimeStats } from '@core/api/models/ps2/character.model';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { NgClass, DecimalPipe } from '@angular/common';

@Component({
    selector: 'planetside-player-stats-kdr-card',
    templateUrl: './planetside-player-stats-kdr-card.component.html',
    styleUrls: ['../stat-card.css', './planetside-player-stats-kdr-card.component.css'],
    imports: [MatCard, MatCardTitle, MatCardContent, NgClass, DecimalPipe]
})

export class PlanetsidePlayerStatsKdrCardComponent {
    readonly stats = input.required<CharacterDetailsLifetimeStats>();
}
