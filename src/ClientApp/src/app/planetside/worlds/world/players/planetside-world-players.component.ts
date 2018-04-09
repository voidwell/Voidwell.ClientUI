import { Component } from '@angular/core';
import { PlanetsideWorldComponent } from './../planetside-world.component';

@Component({
    templateUrl: './planetside-world-players.template.html',
    styleUrls: ['./planetside-world-players.styles.css']
})

export class PlanetsideWorldPlayersComponent {
    players: any[] = [];

    constructor(private parent: PlanetsideWorldComponent) {
        this.parent.getOnlinePlayers()
            .subscribe(players => {
                this.players = players;
            });
    }
}