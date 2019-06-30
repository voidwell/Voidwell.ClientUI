import { Component } from '@angular/core';
import { PlanetsidePlayerComponent } from './../planetside-player.component';

@Component({
    selector: 'character-card',
    templateUrl: './character-card.template.html',
    styleUrls: ['./character-card.styles.css']
})

export class CharacterCardComponent {
    playerData: any;
    navLinks = [
        { path: 'stats', display: 'Stats' },
        { path: 'classes', display: 'Classes' },
        { path: 'vehicles', display: 'Vehicles' },
        { path: 'weapons', display: 'Weapons' },
        { path: 'sessions', display: 'Sessions' },
    ];

    constructor(private planetsidePlayer: PlanetsidePlayerComponent) {
        planetsidePlayer.playerData.subscribe(data => {
            this.playerData = data;
        });
    }
}