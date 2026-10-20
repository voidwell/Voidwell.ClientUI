import { Component, computed, inject } from '@angular/core';
import { PlanetsidePlayerComponent } from '../planetside-player.component';
import { playerTrail } from '../player-breadcrumbs';
import { MatCard, MatCardContent } from '@angular/material/card';
import { PlanetsidePlayerWeaponsTableComponent } from '../weapons-table/planetside-player-weapons-table.component';

@Component({
    templateUrl: './planetside-player-weapons.component.html',
    styleUrls: ['./planetside-player-weapons.component.css'],
    imports: [MatCard, MatCardContent, PlanetsidePlayerWeaponsTableComponent]
})

export class PlanetsidePlayerWeaponsComponent {
    private planetsidePlayer = inject(PlanetsidePlayerComponent);

    readonly weaponStats = computed(() => this.planetsidePlayer.playerData()?.weaponStats ?? []);

    constructor() {
        this.planetsidePlayer.breadcrumbs.set(playerTrail({ label: 'Weapons' }));
    }
}