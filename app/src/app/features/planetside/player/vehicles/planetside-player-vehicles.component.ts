import { Component, inject, effect, untracked, input } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { RouterLink } from '@angular/router';
import { PlanetsidePlayerComponent } from '../planetside-player.component';
import { VehicleRepository } from '@core/api/ps2/vehicle.repository';
import { CharacterDetails, CharacterDetailsVehicleStat, CharacterDetailsWeaponStat } from '@core/api/models/ps2/character.model';
import { VehicleInfo } from '@core/api/models/ps2/reference.model';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardFooter } from '@angular/material/card';
import { PlanetsidePlayerWeaponsTableComponent } from '../weapons-table/planetside-player-weapons-table.component';
import { DecimalPipe } from '@angular/common';
import { DgcImageUrlPipe } from '../../pipes/dgc-image-url.pipe';
import { VehiclesDataSource, VehicleRow } from './planetside-player-vehicles.data-source';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    templateUrl: './planetside-player-vehicles.component.html',
    styleUrls: ['./planetside-player-vehicles.component.css'],
    imports: [LoaderComponent, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatButton, RouterLink, MatIcon, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardFooter, PlanetsidePlayerWeaponsTableComponent, DecimalPipe, DgcImageUrlPipe]
})

export class PlanetsidePlayerVehiclesComponent {
    private planetsidePlayer = inject(PlanetsidePlayerComponent);
    private vehicleRepository = inject(VehicleRepository);
    readonly id = input<string>();

    playerData: CharacterDetails;
    private vehicleList = toSignal(this.vehicleRepository.getVehicles());

    private isLoading: boolean;
    private vehicles: VehicleRow[];
    private vehicleId: number;
    private vehicle: VehicleRow = null;
    private vehicleWeapons: CharacterDetailsWeaponStat[] = [];
    private allVehicles: VehicleInfo[] = [];

    private vehiclesDataSource: DataSource<VehicleRow>;

    constructor() {
        const planetsidePlayer = this.planetsidePlayer;

        this.isLoading = true;
        effect(() => {
            const data = planetsidePlayer.playerData();
            const vehicles = this.vehicleList();

            untracked(() => {
                if (!vehicles) {
                    return;
                }

                if (data !== null) {
                    this.playerData = data;
                    this.filterVehicles(vehicles);

                    if (this.vehicleId) {
                        this.setupVehicle(this.vehicleId);
                    }
                }
                this.isLoading = false;
            });
        });

        effect(() => {
            const id = this.id();

            untracked(() => {
                this.vehicle = null;
                this.vehicleWeapons = [];

                this.vehicleId = parseInt(id);

                if (!this.isLoading && this.vehicleId) {
                    this.setupVehicle(this.vehicleId);
                }
            });
        });
    }

    private filterVehicles(data: VehicleInfo[]) {
        const vehicles: VehicleRow[] = [];

        for (let i = 0; i < data.length; i++) {
            const vehicle = data[i];
            if (vehicle.factions.indexOf(this.playerData.factionId) !== -1 && vehicle.id < 100) {
                vehicles.push({ ...vehicle, stats: {} });
            }
        }

        this.playerData.vehicleStats.forEach(function (d: CharacterDetailsVehicleStat) {
            for (let i = 0; i < vehicles.length; i++) {
                if(vehicles[i].id === d.vehicleId) {
                    vehicles[i].stats = d;
                    break;
                }
            }
        });

        this.vehicles = vehicles.sort(this.sortVehicles);
        this.vehiclesDataSource = new VehiclesDataSource(this.vehicles);
    }

    private setupVehicle(vehicleId: number) {
        for (let k = 0; k < this.vehicles.length; k++) {
            if (this.vehicles[k].id === vehicleId) {
                this.vehicle = this.vehicles[k];
                break;
            }
        }

        for (let w = 0; w < this.playerData.weaponStats.length; w++) {
            const weapon = this.playerData.weaponStats[w];

            if (weapon.vehicleId === vehicleId) {
                this.vehicleWeapons.push(weapon);
            }
        }
    }

    private sortVehicles(a: VehicleRow, b: VehicleRow) {
        if ((a.stats.pilotScore + a.stats.score) < (b.stats.pilotScore + b.stats.score ))
            return 1
        if ((a.stats.pilotScore + a.stats.score) > (b.stats.pilotScore + b.stats.score))
            return -1;
        return 0;
    }

}

