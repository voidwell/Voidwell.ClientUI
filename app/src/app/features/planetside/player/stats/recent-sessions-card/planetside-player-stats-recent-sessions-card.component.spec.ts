import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { CharacterDetails, LatestPlayerSessionSummary } from '@core/api/models/ps2/character.model';
import { CharacterRepository } from '@core/api/ps2/character.repository';
import { PlanetsidePlayerStatsRecentSessionsCardComponent } from './planetside-player-stats-recent-sessions-card.component';

describe('PlanetsidePlayerStatsRecentSessionsCardComponent', () => {
    const summary = (id: number, day: number, kills: number, deaths: number): LatestPlayerSessionSummary => ({
        id: String(id),
        loginDate: `2025-09-${String(day).padStart(2, '0')}T20:00:00Z`,
        logoutDate: `2025-09-${String(day).padStart(2, '0')}T22:00:00Z`,
        duration: 2 * 3600000,
        kills,
        deaths
    });

    const render = (getLatestSessions: (characterId: string) => Observable<LatestPlayerSessionSummary[]>) => {
        TestBed.configureTestingModule({
            providers: [provideRouter([]), { provide: CharacterRepository, useValue: { getLatestSessions } }]
        });
        const fixture = TestBed.createComponent(PlanetsidePlayerStatsRecentSessionsCardComponent);
        fixture.componentRef.setInput('player', { id: 'me' } as CharacterDetails);
        fixture.detectChanges();
        return fixture;
    };

    const cellsOf = (fixture: { nativeElement: HTMLElement }, row: number) =>
        Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('tbody tr')[row].querySelectorAll('td')).map(c => c.textContent.trim());

    it('shows the latest sessions with their kills and K/D, newest first', () => {
        const requested: string[] = [];
        const fixture = render(characterId => {
            requested.push(characterId);
            return of([summary(1, 1, 3, 1), summary(2, 2, 4, 3), summary(3, 3, 2, 0)]);
        });

        expect(requested).toEqual(['me']);
        expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(3);
        expect(cellsOf(fixture, 0)).toEqual([expect.stringContaining('Sep 3, 2025'), '2', '2.00', '2.0h']);
        expect(cellsOf(fixture, 1)[2]).toBe('1.33');
        expect(fixture.nativeElement.querySelector('tbody tr a').getAttribute('href')).toBe('/ps2/player/me/sessions/3');
        const headers = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('th')).map(h => h.textContent.trim());
        expect(headers).toEqual(['Date / Time', 'Kills', 'K/D', 'Duration']);
    });

    it('shows the empty state when the request fails', () => {
        const fixture = render(() => throwError(() => new Error('nope')));

        expect(fixture.nativeElement.querySelector('tbody td').textContent).toContain('No sessions recorded');
    });
});
