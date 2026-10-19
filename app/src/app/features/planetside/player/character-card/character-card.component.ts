import { Component, inject } from '@angular/core';
import { PlanetsidePlayerComponent } from '../planetside-player.component';
import { MatCard, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { NgClass, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { VWTabNavSubBarComponent } from '@shared/ui/vw-tab-nav-sub-bar/vw-tab-nav-sub-bar.component';

@Component({
    selector: 'character-card',
    templateUrl: './character-card.component.html',
    styleUrls: ['./character-card.component.css'],
    imports: [LoaderComponent, MatIcon, RouterLink, MatCard, NgClass, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardFooter, VWTabNavSubBarComponent, DatePipe]
})

export class CharacterCardComponent {
    private planetsidePlayer = inject(PlanetsidePlayerComponent);

    readonly player = this.planetsidePlayer.playerData;

    navLinks = [
        { path: 'stats', display: 'Stats' },
        { path: 'directives', display: 'Directives' }
    ];

}