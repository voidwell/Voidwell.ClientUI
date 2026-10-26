import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { WeaponLeaderboardRow } from '@core/api/models/ps2/weapon.model';
import { LeaderboardRepository } from '@core/api/ps2/leaderboard.repository';
import { PerformanceGrades } from '../../../data/performance-grades.service';
import { TopPlayersCardComponent } from './top-players-card.component';

const row = (i: number): WeaponLeaderboardRow => ({
    characterId: `${i}`, name: `Player ${i}`, factionId: 1, worldId: 10, kills: 1000 - i, deaths: 500, headshots: 100,
    shotsFired: 4000, shotsHit: 1000, playTime: 36000, score: 0, vehicleKills: 0, kdrDelta: i === 0 ? 1 : undefined
});

describe('TopPlayersCardComponent', () => {
    const setup = (getWeaponLeaderboard: () => unknown) => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                { provide: LeaderboardRepository, useValue: { getWeaponLeaderboard } },
                { provide: PerformanceGrades, useValue: { grades: signal([{ grade: 'A', delta: 0 }, { grade: 'F', delta: -99 }]) } }
            ]
        });
        const fixture = TestBed.createComponent(TopPlayersCardComponent);
        fixture.componentRef.setInput('itemId', '1894');
        fixture.detectChanges();
        return fixture.nativeElement as HTMLElement;
    };

    it('lists the top ten players and links on to the leaderboard', () => {
        const element = setup(() => of(Array.from({ length: 50 }, (_, i) => row(i))));
        const rows = element.querySelectorAll('tbody tr');

        expect(rows.length).toBe(10);
        expect(rows[0].querySelector('.stat-link')?.getAttribute('href')).toBe('/ps2/player/0');
        expect(rows[0].querySelector('vw-grade')?.textContent).toBe('A');
        expect(rows[1].querySelector('.placeholder')).not.toBeNull();
        expect(element.querySelector('.stat-action')?.getAttribute('href')).toBe('/ps2/item/1894/leaderboard');
    });

    it('says so when the leaderboard cannot be loaded, or is empty', () => {
        expect(setup(() => throwError(() => new Error('down'))).textContent).toContain('unavailable');
        TestBed.resetTestingModule();
        expect(setup(() => of([])).textContent).toContain('No one has a kill');
    });
});
