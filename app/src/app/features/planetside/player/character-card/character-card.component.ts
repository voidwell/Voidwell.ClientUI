import { Component, inject } from '@angular/core';
import { PlanetsidePlayerComponent } from '../planetside-player.component';
import { MatCard, MatCardTitle, MatCardSubtitle, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { NgClass, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { FactionIconComponent } from '../../components/faction-icon/faction-icon.component';

@Component({
    selector: 'character-card',
    templateUrl: './character-card.component.html',
    styleUrls: ['./character-card.component.css'],
    imports: [LoaderComponent, MatIcon, RouterLink, MatCard, NgClass, MatCardTitle, MatCardSubtitle, MatCardContent, FactionIconComponent, DatePipe]
})

export class CharacterCardComponent {
    private planetsidePlayer = inject(PlanetsidePlayerComponent);

    readonly player = this.planetsidePlayer.playerData;

}