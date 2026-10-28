import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CharacterDetails, CharacterDetailsVehicleStat } from '@core/api/models/ps2/character.model';
import { VehicleInfo } from '@core/api/models/ps2/reference.model';
import { VehicleRepository } from '@core/api/ps2/vehicle.repository';
import { PlanetsidePlayerStatsVehicleUsageCardComponent } from './planetside-player-stats-vehicle-usage-card.component';

describe('PlanetsidePlayerStatsVehicleUsageCardComponent', () => {
    const HOUR = 3600;

    const render = (vehicles: VehicleInfo[], vehicleStats: CharacterDetailsVehicleStat[]) => {
        TestBed.configureTestingModule({
            providers: [provideRouter([]), { provide: VehicleRepository, useValue: { getVehicles: () => of(vehicles) } }]
        });
        const fixture = TestBed.createComponent(PlanetsidePlayerStatsVehicleUsageCardComponent);
        fixture.componentRef.setInput('player', { id: '42', factionId: 2, vehicleStats } as CharacterDetails);
        fixture.detectChanges();
        return fixture;
    };
    const legend = (element: HTMLElement) =>
        Array.from(element.querySelectorAll<HTMLElement>('.legend li')).map(li => [li.querySelector('.name')?.textContent, li.querySelector('.hours')?.textContent]);

    it('lists the vehicles the vehicles page shows by pilot time, and links to it', () => {
        const fixture = render(
            [
                { id: 5, name: 'Vanguard', factions: [2] },
                { id: 10, name: 'Liberator', factions: [1, 2, 3] },
                { id: 4, name: 'Magrider', factions: [1] },
                { id: 2033, name: 'Javelin', factions: [1, 2, 3] },
                { id: 1, name: 'Flash', factions: [1, 2, 3] }
            ],
            [
                { vehicleId: 5, pilotPlayTime: 10 * HOUR, playTime: 2 * HOUR },
                { vehicleId: 10, pilotPlayTime: 5 * HOUR, playTime: 15 * HOUR },
                { vehicleId: 4, pilotPlayTime: 50 * HOUR },
                { vehicleId: 2033, pilotPlayTime: 50 * HOUR },
                { vehicleId: 1, pilotPlayTime: 0, playTime: 0 }
            ]);

        const element = fixture.nativeElement as HTMLElement;

        expect(legend(element)).toEqual([['Vanguard', '10h'], ['Liberator', '5h']]);
        expect(element.textContent).toContain('15h');
        expect(element.querySelector('.stat-action')?.getAttribute('href')).toBe('/ps2/player/42/vehicles');

        fixture.componentInstance.seat.set('passenger');
        fixture.detectChanges();

        expect(legend(element)).toEqual([['Liberator', '15h'], ['Vanguard', '2h']]);
    });

    it('adds up the least played vehicles as Other', () => {
        const vehicles = Array.from({ length: 9 }, (_, i) => ({ id: i + 1, name: `V${i + 1}`, factions: [2] }));
        const element = render(vehicles, vehicles.map(v => ({ vehicleId: v.id, pilotPlayTime: (20 - v.id) * HOUR }))).nativeElement as HTMLElement;

        expect(legend(element).map(([name]) => name)).toEqual(['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'Other (3)']);
        expect(legend(element)[6][1]).toBe('36h');
    });

    it('says so when the player has no time in the chosen seat', () => {
        const fixture = render([{ id: 5, name: 'Vanguard', factions: [2] }], [{ vehicleId: 5, pilotPlayTime: 0, playTime: HOUR }]);
        const element = fixture.nativeElement as HTMLElement;

        expect(element.querySelector('svg')).toBeNull();
        expect(element.textContent).toContain('No time as pilot yet.');

        fixture.componentInstance.seat.set('passenger');
        fixture.detectChanges();

        expect(element.querySelector('svg')).not.toBeNull();
    });
});
