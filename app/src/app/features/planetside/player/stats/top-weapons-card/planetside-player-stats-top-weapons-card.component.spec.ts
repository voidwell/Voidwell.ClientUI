import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CharacterDetails, CharacterDetailsWeaponStat } from '@core/api/models/ps2/character.model';
import { PlanetsidePlayerStatsTopWeaponsCardComponent } from './planetside-player-stats-top-weapons-card.component';

describe('PlanetsidePlayerStatsTopWeaponsCardComponent', () => {
    const weapon = (itemId: number, name: string, kills: number): CharacterDetailsWeaponStat =>
        ({ itemId, name, stats: { kills, fireCount: 1000, hitCount: 250 } });

    it('shows the five weapons with the most kills', () => {
        TestBed.configureTestingModule({ providers: [provideRouter([])] });
        const fixture = TestBed.createComponent(PlanetsidePlayerStatsTopWeaponsCardComponent);
        fixture.componentRef.setInput('player', {
            id: '42',
            weaponStats: [
                weapon(1, 'A', 10), weapon(2, 'B', 500), weapon(3, 'C', 0), weapon(4, 'D', 90),
                weapon(5, 'E', 80), weapon(6, 'F', 70), weapon(7, 'G', 60)
            ]
        } as CharacterDetails);

        fixture.detectChanges();

        const names = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('tbody tr td:first-child')).map(e => e.textContent.trim());
        expect(names).toEqual(['B', 'D', 'E', 'F', 'G']);
        expect(fixture.nativeElement.textContent).toContain('25.0%');
        expect(fixture.nativeElement.querySelector('.stat-action').getAttribute('href')).toBe('/ps2/player/42/weapons');
    });
});
