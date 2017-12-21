import { Component } from '@angular/core';
import { PlanetsidePlayerComponent } from './../planetside-player.component';

@Component({
    templateUrl: './planetside-player-stats.template.html',
    styleUrls: ['./planetside-player-stats.styles.css']
})

export class PlanetsidePlayerStatsComponent {
    private playerData: any;

    constructor(private planetsidePlayer: PlanetsidePlayerComponent) {
        planetsidePlayer.playerData.subscribe(data => {
            this.playerData = data;
        });
    }
}