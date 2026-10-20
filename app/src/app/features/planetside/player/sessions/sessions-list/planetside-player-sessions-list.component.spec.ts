import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { CharacterDetails, PlayerSessionSummary } from '@core/api/models/ps2/character.model';
import { CharacterRepository } from '@core/api/ps2/character.repository';
import { PlanetsidePlayerComponent } from '../../planetside-player.component';
import { PlanetsidePlayerSessionsListComponent } from './planetside-player-sessions-list.component';

const session = (id: number, loginDate: string, minutes: number): PlayerSessionSummary =>
    ({ id, loginDate, logoutDate: loginDate, duration: minutes * 60000 });

describe('PlanetsidePlayerSessionsListComponent', () => {
    let pages: Subject<PlayerSessionSummary[]>[];
    let component: PlanetsidePlayerSessionsListComponent;

    beforeEach(() => {
        pages = [];
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                { provide: PlanetsidePlayerComponent, useValue: { playerData: signal({ id: '42' } as CharacterDetails), breadcrumbs: signal([]) } },
                { provide: CharacterRepository, useValue: { getSessions: () => { const page = new Subject<PlayerSessionSummary[]>(); pages.push(page); return page; } } }
            ]
        });
        const fixture = TestBed.createComponent(PlanetsidePlayerSessionsListComponent);
        fixture.detectChanges();
        component = fixture.componentInstance;
    });

    it('groups sessions by month, newest first, and sums them up', () => {
        pages[0].next([session(1, '2026-02-15T19:00:00', 30), session(2, '2026-04-16T19:00:00', 90), session(3, '2026-02-01T19:00:00', 60)]);

        expect(component.months().map(group => [new Date(group.month).getMonth(), group.sessions.map(s => s.id), group.totalDuration / 60000]))
            .toEqual([[3, [2], 90], [1, [1, 3], 90]]);
        expect(component.summary()).toEqual(expect.objectContaining({ count: 3, total: 180 * 60000, average: 60 * 60000, longest: 90 * 60000 }));
        expect(component.hasMore()).toBe(false);
    });

    it('loads older pages until one comes back short', () => {
        pages[0].next(Array.from({ length: 25 }, (_, i) => session(i, `2026-03-${String(i + 1).padStart(2, '0')}T10:00:00`, 10)));
        expect(component.hasMore()).toBe(true);

        component.loadMore();
        expect(component.loadingMore()).toBe(true);
        pages[1].next([session(100, '2025-01-01T10:00:00', 10)]);

        expect(component.sessions()?.length).toBe(26);
        expect(component.loadingMore()).toBe(false);
        expect(component.hasMore()).toBe(false);
    });

    it('keeps the loaded sessions when an older page fails', () => {
        pages[0].next(Array.from({ length: 25 }, (_, i) => session(i, '2026-03-01T10:00:00', 10)));
        component.loadMore();
        pages[1].error(new Error('down'));

        expect(component.errorMessage()).toBeNull();
        expect(component.sessions()?.length).toBe(25);
        expect(component.hasMore()).toBe(true);
    });
});
