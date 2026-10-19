import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { VehicleRepository } from '@core/api/ps2/vehicle.repository';
import { CharacterDetailsVehicleStat } from '@core/api/models/ps2/character.model';
import { VehicleInfo } from '@core/api/models/ps2/reference.model';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { PlanetsidePlayerComponent } from '../planetside-player.component';
import { PlanetsidePlayerWeaponsTableComponent } from '../weapons-table/planetside-player-weapons-table.component';
import { PlanetsideStatTileComponent } from '../stat-tile/planetside-stat-tile.component';
import { DgcImageUrlPipe } from '../../pipes/dgc-image-url.pipe';
import { hours, perHour, perMinute, ratio } from '../stat-math';

export interface VehicleRow {
    vehicle: VehicleInfo;
    stats: Partial<CharacterDetailsVehicleStat>;
    /**
     * Seconds in the vehicle, at least: the longer of the pilot and gunner times. The two overlap (a single-seat
     * aircraft has near-equal pilot and gunner time), so they cannot be added up.
     */
    playTime: number;
}

/** The player's vehicles, and one vehicle in detail when the route names it. */
@Component({
    templateUrl: './planetside-player-vehicles.component.html',
    styleUrls: ['../player-detail.css'],
    imports: [LoaderComponent, MatCard, MatCardTitle, MatCardContent, MatIcon, RouterLink, DecimalPipe, PercentPipe, DgcImageUrlPipe, PlanetsidePlayerWeaponsTableComponent, PlanetsideStatTileComponent]
})
export class PlanetsidePlayerVehiclesComponent {
    private vehicleRepository = inject(VehicleRepository);

    /** The vehicle to show in detail, if any. */
    readonly id = input<string>();

    readonly player = inject(PlanetsidePlayerComponent).playerData;
    private readonly vehicleList = toSignal(this.vehicleRepository.getVehicles());

    readonly ratio = ratio;
    readonly perHour = perHour;
    readonly perMinute = perMinute;
    readonly hours = hours;

    /** The player's faction's vehicles (ids below 100) with their stats, most played first; `undefined` while loading. */
    readonly vehicles = computed<VehicleRow[] | undefined>(() => {
        const player = this.player();
        const vehicles = this.vehicleList();
        if (!player || !vehicles) {
            return undefined;
        }
        return vehicles
            .filter(vehicle => vehicle.id < 100 && vehicle.factions?.includes(player.factionId))
            .map((vehicle): VehicleRow => {
                const stats: Partial<CharacterDetailsVehicleStat> = (player.vehicleStats ?? []).find(stat => stat.vehicleId === vehicle.id) ?? {};
                return { vehicle, stats, playTime: Math.max(stats.pilotPlayTime ?? 0, stats.playTime ?? 0) };
            })
            .sort((a, b) => b.playTime - a.playTime);
    });

    /** The vehicles the player has spent time in, to switch between in the detail view. */
    readonly played = computed(() => (this.vehicles() ?? []).filter(row => row.playTime > 0));

    readonly selected = computed(() => {
        const id = Number(this.id());
        return id ? this.vehicles()?.find(row => row.vehicle.id === id) : undefined;
    });

    readonly weapons = computed(() => {
        const selected = this.selected();
        return selected ? (this.player()?.weaponStats ?? []).filter(weapon => weapon.vehicleId === selected.vehicle.id) : [];
    });

    /** Kills made by running enemies over: kills as pilot beyond those of the vehicle's weapons. */
    roadkills(stats: Partial<CharacterDetailsVehicleStat>): number {
        return Math.max(0, (stats.pilotKills ?? 0) - (stats.kills ?? 0));
    }
}
