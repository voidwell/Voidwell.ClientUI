import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { PlanetsidePlayerComponent } from '../planetside-player.component';
import { MatCard, MatCardTitle, MatCardContent, MatCardFooter } from '@angular/material/card';
import { NgClass, DecimalPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PlanetsidePlayerStatsSiegeCardComponent } from './siege-card/planetside-player-stats-siege-card.component';
import { GradeComponent } from '../../components/vw-grade/vw-grade.component';
import { FactionColorPipe } from '../../pipes/faction-color.pipe';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './planetside-player-stats.component.html',
    styleUrls: ['./planetside-player-stats.component.css'],
    imports: [MatCard, MatCardTitle, MatCardContent, NgClass, RouterLink, PlanetsidePlayerStatsSiegeCardComponent, MatCardFooter, GradeComponent, DecimalPipe, DatePipe, FactionColorPipe]
})

export class PlanetsidePlayerStatsComponent {
    private planetsidePlayer = inject(PlanetsidePlayerComponent);

    readonly player = this.planetsidePlayer.playerData;


}