import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { WeaponLeaderboardRow } from '@core/api/models/ps2/weapon.model';
import { LeaderboardRepository } from '@core/api/ps2/leaderboard.repository';
import { PerformanceGrades } from '../../data/performance-grades.service';
import { PlanetsideItemComponent } from '../planetside-item.component';
import { PlanetsideItemLeaderboardComponent } from './planetside-item-leaderboard.component';

const page = (start: number, count: number): WeaponLeaderboardRow[] => Array.from({ length: count }, (_, i) => ({
    characterId: `${start + i}`, name: `Player ${start + i}`, factionId: 2, worldId: 10, kills: 5000 - start - i, deaths: 1000, headshots: 500,
    shotsFired: 20000, shotsHit: 5000, playTime: 360000, score: 0, vehicleKills: 3
}));

describe('PlanetsideItemLeaderboardComponent', () => {
    const setup = (getWeaponLeaderboard: (id: string, page: number, sort: string, dir: string) => unknown) => {
        const item = { itemId: signal('1894'), breadcrumbs: signal<unknown[]>([]) };
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                { provide: PlanetsideItemComponent, useValue: item },
                { provide: LeaderboardRepository, useValue: { getWeaponLeaderboard } },
                { provide: PerformanceGrades, useValue: { grades: signal([{ grade: 'A', delta: 0 }, { grade: 'F', delta: -99 }]) } }
            ]
        });
        const fixture = TestBed.createComponent(PlanetsideItemLeaderboardComponent);
        fixture.detectChanges();
        return { fixture, item, element: fixture.nativeElement as HTMLElement };
    };
    const ranks = (element: HTMLElement) => Array.from(element.querySelectorAll('tbody tr:not(.stat-detail) td:first-child')).map(e => e.textContent?.trim());

    it('ranks the first page by kills and sets the breadcrumbs', () => {
        const calls: unknown[][] = [];
        const { element, item } = setup((...args) => { calls.push(args); return of(page(0, 50)); });

        expect(calls).toEqual([['1894', 0, 'kills', 'desc']]);
        expect(ranks(element).slice(0, 2)).toEqual(['1', '2']);
        expect(element.querySelector('.stat-pager')?.textContent).toContain('Ranks 1–50');
        expect(item.breadcrumbs()).toEqual([{ label: 'Overview', link: '/ps2/item/1894/stats' }, { label: 'Leaderboard' }]);
    });

    it('pages on, numbering ranks from the page, and stops at a short page', () => {
        const { fixture, element } = setup((_id, p) => of(p === 0 ? page(0, 50) : page(50, 20)));
        (element.querySelector('[aria-label="Next page"]') as HTMLButtonElement).click();
        fixture.detectChanges();

        expect(ranks(element)[0]).toBe('51');
        expect(element.querySelector('.stat-pager')?.textContent).toContain('Ranks 51–70');
        expect((element.querySelector('[aria-label="Next page"]') as HTMLButtonElement).disabled).toBe(true);
        expect((element.querySelector('[aria-label="Previous page"]') as HTMLButtonElement).disabled).toBe(false);
    });

    it('asks the server for a new sort from the first page', () => {
        const calls: unknown[][] = [];
        const { fixture, element } = setup((...args) => { calls.push(args); return of(page(0, 50)); });
        (element.querySelector('[aria-label="Next page"]') as HTMLButtonElement).click();
        fixture.detectChanges();
        (element.querySelector('th[mat-sort-header="kdr"]') as HTMLElement).click();
        fixture.detectChanges();

        expect(calls[calls.length - 1]).toEqual(['1894', 0, 'kdr', 'desc']);
    });

    it('says so when the leaderboard cannot be loaded', () => {
        const { element } = setup(() => throwError(() => new Error('down')));

        expect(element.textContent).toContain('unavailable');
        expect(element.querySelector('.stat-pager')).toBeNull();
    });
});
