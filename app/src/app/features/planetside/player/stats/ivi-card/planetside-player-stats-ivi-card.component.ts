import { Component, input } from '@angular/core';
import { InfantryStats } from '@core/api/models/ps2/character.model';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { DecimalPipe } from '@angular/common';
import { GradeComponent } from '../../../components/vw-grade/vw-grade.component';

@Component({
    selector: 'planetside-player-stats-ivi-card',
    templateUrl: './planetside-player-stats-ivi-card.component.html',
    styleUrls: ['../stat-card.css', './planetside-player-stats-ivi-card.component.css'],
    imports: [MatCard, MatCardTitle, MatCardContent, DecimalPipe, GradeComponent]
})

export class PlanetsidePlayerStatsIviCardComponent {
    readonly stats = input.required<InfantryStats>();
}
