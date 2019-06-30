import { Component } from '@angular/core';
import { PlanetsidePlayerComponent } from './../planetside-player.component';

@Component({
    templateUrl: './planetside-player-weapons.template.html',
    styleUrls: ['./planetside-player-weapons.styles.css']
})

export class PlanetsidePlayerWeaponsComponent {
    playerData: any;

    private weaponStats: any[];

    constructor(private planetsidePlayer: PlanetsidePlayerComponent) {
        planetsidePlayer.playerData.subscribe(data => {
            this.playerData = data;

            if (this.playerData !== null) {
                this.weaponStats = this.playerData.weaponStats;
            }
        });
    }
}