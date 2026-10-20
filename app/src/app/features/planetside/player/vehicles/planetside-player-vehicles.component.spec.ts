import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CharacterDetails } from '@core/api/models/ps2/character.model';
import { VehicleRepository } from '@core/api/ps2/vehicle.repository';
import { PlanetsidePlayerComponent } from '../planetside-player.component';
import { PlanetsidePlayerVehiclesComponent } from './planetside-player-vehicles.component';

const HOUR = 3600;

const PLAYER = {
    id: '42',
    factionId: 1,
    vehicleStats: [
        // A single-seat aircraft: pilot and gunner time overlap
        { vehicleId: 7, pilotPlayTime: 115 * HOUR, playTime: 115 * HOUR, pilotKills: 50, kills: 40 },
        // The Galaxy pilot has no gun: gunner time is time in the gunner seats
        { vehicleId: 11, pilotPlayTime: 167 * HOUR, playTime: 40 * HOUR, pilotKills: 10, kills: 30 },
        { vehicleId: 4, pilotPlayTime: 20 * HOUR, playTime: 0 }
    ],
    weaponStats: [{ itemId: 1, vehicleId: 7 }, { itemId: 2, vehicleId: 11 }, { itemId: 3 }]
} as CharacterDetails;

const VEHICLES = [
    { id: 4, name: 'Magrider', factions: [1] },
    { id: 7, name: 'Scythe', factions: [1] },
    { id: 8, name: 'Reaver', factions: [2] },
    { id: 11, name: 'Galaxy', factions: [1, 2, 3] },
    { id: 14, name: 'Valkyrie', factions: [1, 2, 3] },
    { id: 2033, name: 'Javelin', factions: [1, 2, 3] }
];

describe('PlanetsidePlayerVehiclesComponent', () => {
    let component: PlanetsidePlayerVehiclesComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                { provide: PlanetsidePlayerComponent, useValue: { playerData: signal(PLAYER) } },
                { provide: VehicleRepository, useValue: { getVehicles: () => of(VEHICLES) } }
            ]
        });
        const fixture = TestBed.createComponent(PlanetsidePlayerVehiclesComponent);
        component = fixture.componentInstance;
    });

    it('lists the faction\'s vehicles by the longer of pilot and gunner time, without adding them up', () => {
        const rows = component.vehicles() ?? [];

        expect(rows.map(row => [row.vehicle.name, row.playTime / HOUR])).toEqual([['Galaxy', 167], ['Scythe', 115], ['Magrider', 20], ['Valkyrie', 0]]);
    });

    it('shows the selected vehicle with its own weapons', () => {
        const fixture = TestBed.createComponent(PlanetsidePlayerVehiclesComponent);
        fixture.componentRef.setInput('id', '7');

        expect(fixture.componentInstance.selected()?.vehicle.name).toBe('Scythe');
        expect(fixture.componentInstance.weapons().map(w => w.itemId)).toEqual([1]);
    });

    it('counts roadkills as pilot kills beyond weapon kills, never below zero', () => {
        expect(component.roadkills({ pilotKills: 50, kills: 40 })).toBe(10);
        expect(component.roadkills({ pilotKills: 10, kills: 30 })).toBe(0);
        expect(component.roadkills({})).toBe(0);
    });
});
