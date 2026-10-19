import { Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { CharacterDetails } from '@core/api/models/ps2/character.model';
import { VehicleRepository } from '@core/api/ps2/vehicle.repository';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { PlanetsidePlayerStatsUsageDonutComponent, UsageEntry } from '../usage-donut/planetside-player-stats-usage-donut.component';

/** Vehicles shown on their own; the rest are added up as "Other". */
const MAX_VEHICLES = 6;
const OTHER_COLOR = '#5d7079';

/**
 * Whose time the chart shows. The API's pilot and gunner times overlap (a single-seat aircraft has near-equal
 * amounts of both), so they are charted one at a time rather than added up.
 */
export type VehicleSeat = 'pilot' | 'passenger';

@Component({
    selector: 'planetside-player-stats-vehicle-usage-card',
    templateUrl: './planetside-player-stats-vehicle-usage-card.component.html',
    styleUrls: ['./planetside-player-stats-vehicle-usage-card.component.css'],
    imports: [LoaderComponent, MatCard, MatCardTitle, MatCardContent, MatButtonToggleGroup, MatButtonToggle, RouterLink, PlanetsidePlayerStatsUsageDonutComponent]
})

export class PlanetsidePlayerStatsVehicleUsageCardComponent {
    private vehicleRepository = inject(VehicleRepository);

    readonly player = input.required<CharacterDetails>();

    readonly seat = signal<VehicleSeat>('pilot');

    /** Every vehicle, `undefined` until loaded. */
    readonly vehicles = toSignal(this.vehicleRepository.getVehicles());

    /**
     * Time in each vehicle the vehicles page lists (the player's faction's, ids below 100) in the chosen seat, most
     * played first. Passenger time is the API's gunner time.
     */
    readonly vehicleTimes = computed<UsageEntry[]>(() => {
        const player = this.player();
        const vehicles = this.vehicles() ?? [];
        const seat = this.seat();

        const entries = vehicles
            .filter(vehicle => vehicle.id < 100 && vehicle.factions?.includes(player.factionId))
            .map(vehicle => {
                const stats = (player.vehicleStats ?? []).find(stat => stat.vehicleId === vehicle.id);
                return { id: vehicle.id, name: vehicle.name ?? '', playTime: (seat === 'pilot' ? stats?.pilotPlayTime : stats?.playTime) ?? 0 };
            })
            .filter(entry => entry.playTime > 0)
            .sort((a, b) => b.playTime - a.playTime);

        if (entries.length <= MAX_VEHICLES + 1) {
            return entries;
        }

        const others = entries.slice(MAX_VEHICLES);
        return [
            ...entries.slice(0, MAX_VEHICLES),
            { id: 'other', name: `Other (${others.length})`, playTime: others.reduce((sum, entry) => sum + entry.playTime, 0), color: OTHER_COLOR }
        ];
    });
}
