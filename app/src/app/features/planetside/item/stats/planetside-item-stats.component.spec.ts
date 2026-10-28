import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { WeaponInfoResult } from '@core/api/models/ps2/weapon.model';
import { LeaderboardRepository } from '@core/api/ps2/leaderboard.repository';
import { PlanetsideItemComponent } from '../planetside-item.component';
import { PlanetsideItemStatsComponent } from './planetside-item-stats.component';

const LMG: WeaponInfoResult = {
    itemId: 1894, name: 'Betelgeuse 54-A', category: 'LMG', factionId: 1, factionName: 'Vanu Sovereignty', maxStackSize: 1, range: 'Medium',
    fireRateMs: 80, clipSize: 45, capacity: 0, muzzleVelocity: 615, minDamage: 112, maxDamage: 143, minDamageRange: 65, maxDamageRange: 10,
    minReloadSpeed: 2500, maxReloadSpeed: 7000, ironSightZoom: 1.35, fireModes: ['Auto'], isVehicleWeapon: false, damageRadius: 0,
    hipAcc: { crouching: 2.25, crouchWalking: 2.5, standing: 2.5, running: 3.25, cof: 0.1 },
    aimAcc: { crouching: 0.1, crouchWalking: 0.2, standing: 0.1, running: 0.4, cof: 0.05 }
};

describe('PlanetsideItemStatsComponent', () => {
    const setup = (weapon: WeaponInfoResult) => {
        const item = { weaponData: signal(weapon), itemId: signal('1894'), breadcrumbs: signal([]) };
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                { provide: PlanetsideItemComponent, useValue: item },
                { provide: LeaderboardRepository, useValue: { getWeaponLeaderboard: () => of([]) } }
            ]
        });
        const fixture = TestBed.createComponent(PlanetsideItemStatsComponent);
        fixture.detectChanges();
        return { element: fixture.nativeElement as HTMLElement, item };
    };
    const labels = (element: HTMLElement) => Array.from(element.querySelectorAll('.stat-metric-label')).map(e => e.textContent);
    const values = (element: HTMLElement) => Array.from(element.querySelectorAll('.stat-metric-value')).map(e => e.textContent?.replace(/\s+/g, ' ').trim());

    it('shows an infantry weapon\'s specifications, damage, kill figures and accuracy', () => {
        const { element, item } = setup(LMG);

        expect(labels(element)).toEqual(['Damage', 'Fire Rate', 'Magazine', 'Reload', 'Muzzle Velocity', 'Iron Sight Zoom', 'Shots to Kill', 'Time to Kill']);
        expect(values(element)).toContain('750 RPM');
        expect(values(element)).toContain('7–9');
        expect(values(element)).toContain('480–640 ms');
        expect(element.querySelector('.facts')?.textContent).not.toContain('Faction');
        expect(element.querySelectorAll('.accuracy tbody tr').length).toBe(5);
        expect(item.breadcrumbs()).toEqual([{ label: 'Overview' }]);
    });

    it('leaves out damage and accuracy for a vehicle weapon', () => {
        const { element } = setup({ ...LMG, isVehicleWeapon: true, hipAcc: undefined, aimAcc: undefined, damageRadius: 3 });

        expect(element.querySelector('item-damage-chart')).toBeNull();
        expect(element.querySelector('.accuracy')).toBeNull();
        expect(labels(element)).not.toContain('Damage');
        expect(element.querySelector('.facts')?.textContent).toContain('Damage radius');
        expect(element.querySelector('item-top-players-card')).not.toBeNull();
    });
});
