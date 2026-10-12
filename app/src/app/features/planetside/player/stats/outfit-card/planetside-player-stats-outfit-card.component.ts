import { Component, input } from '@angular/core';
import { CharacterDetails } from '@core/api/models/ps2/character.model';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { NgClass, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FactionColorPipe } from '../../../pipes/faction-color.pipe';

@Component({
    selector: 'planetside-player-stats-outfit-card',
    templateUrl: './planetside-player-stats-outfit-card.component.html',
    styleUrls: ['./planetside-player-stats-outfit-card.component.css'],
    imports: [MatCard, MatCardTitle, MatCardContent, NgClass, RouterLink, DatePipe, FactionColorPipe]
})

export class PlanetsidePlayerStatsOutfitCardComponent {
    readonly player = input.required<CharacterDetails>();
}
