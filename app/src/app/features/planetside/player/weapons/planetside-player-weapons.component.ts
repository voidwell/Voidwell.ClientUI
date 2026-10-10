import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { PlanetsidePlayerComponent } from '../planetside-player.component';
import { PlanetsidePlayerWeaponsTableComponent } from '../weapons-table/planetside-player-weapons-table.component';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './planetside-player-weapons.component.html',
    styleUrls: ['./planetside-player-weapons.component.css'],
    imports: [PlanetsidePlayerWeaponsTableComponent]
})

export class PlanetsidePlayerWeaponsComponent {
    private planetsidePlayer = inject(PlanetsidePlayerComponent);

    readonly weaponStats = computed(() => this.planetsidePlayer.playerData()?.weaponStats ?? []);
}