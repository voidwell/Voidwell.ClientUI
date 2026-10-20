import { Component, inject } from '@angular/core';
import { PlanetsidePlayerComponent } from '../planetside-player.component';
import { MatCard, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { NgClass, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LoaderComponent } from '@shared/ui/loader/loader.component';

@Component({
    selector: 'character-card',
    templateUrl: './character-card.component.html',
    styleUrls: ['./character-card.component.css'],
    imports: [LoaderComponent, MatIcon, RouterLink, MatCard, NgClass, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardFooter, DatePipe]
})

export class CharacterCardComponent {
    private planetsidePlayer = inject(PlanetsidePlayerComponent);

    readonly player = this.planetsidePlayer.playerData;
    readonly breadcrumbs = this.planetsidePlayer.breadcrumbs;
}