import { Component, input } from '@angular/core';
import { CharacterDetailsLifetimeStats } from '@core/api/models/ps2/character.model';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { NgClass, DecimalPipe } from '@angular/common';

@Component({
    selector: 'planetside-player-stats-weapons-card',
    templateUrl: './planetside-player-stats-weapons-card.component.html',
    styleUrls: ['./planetside-player-stats-weapons-card.component.css'],
    imports: [MatCard, MatCardTitle, MatCardContent, NgClass, DecimalPipe]
})

export class PlanetsidePlayerStatsWeaponsCardComponent {
    readonly stats = input.required<CharacterDetailsLifetimeStats>();
}
