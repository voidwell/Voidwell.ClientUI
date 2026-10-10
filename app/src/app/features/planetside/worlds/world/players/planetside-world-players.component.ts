import { Component, inject } from '@angular/core';
import { PlanetsideWorldComponent } from '../planetside-world.component';
import { OnlineCharacter } from '@core/api/models/ps2/character.model';
import { MatCard, MatCardContent, MatCardFooter } from '@angular/material/card';
import { NgClass, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgArrayPipesModule, NgObjectPipesModule } from 'ngx-pipes';
import { FactionColorPipe } from '../../../pipes/faction-color.pipe';
import { FactionNamePipe } from '../../../pipes/faction-name.pipe';

@Component({
    templateUrl: './planetside-world-players.component.html',
    styleUrls: ['./planetside-world-players.component.css'],
    imports: [MatCard, MatCardContent, NgClass, MatCardFooter, RouterLink, DatePipe, NgArrayPipesModule, NgObjectPipesModule, FactionColorPipe, FactionNamePipe]
})

export class PlanetsideWorldPlayersComponent {
    private parent = inject(PlanetsideWorldComponent);

    players: OnlineCharacter[] = [];

    constructor() {
        this.parent.getOnlinePlayers()
            .subscribe(players => {
                this.players = players;
            });
    }
}