import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { PlanetsidePlayerComponent } from '../planetside-player.component';
import { MatCard, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardFooter } from '@angular/material/card';
import { NgClass, DatePipe } from '@angular/common';
import { VWTabNavSubBarComponent } from '@shared/ui/vw-tab-nav-sub-bar/vw-tab-nav-sub-bar.component';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'character-card',
    templateUrl: './character-card.component.html',
    styleUrls: ['./character-card.component.css'],
    imports: [MatCard, NgClass, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardFooter, VWTabNavSubBarComponent, DatePipe]
})

export class CharacterCardComponent {
    private planetsidePlayer = inject(PlanetsidePlayerComponent);

    readonly player = this.planetsidePlayer.playerData;

    navLinks = [
        { path: 'stats', display: 'Stats' },
        { path: 'classes', display: 'Classes' },
        { path: 'vehicles', display: 'Vehicles' },
        { path: 'weapons', display: 'Weapons' },
        { path: 'sessions', display: 'Sessions' },
        { path: 'directives', display: 'Directives' }
    ];

}