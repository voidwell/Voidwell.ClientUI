import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CharacterDetails, PlayerSession, PlayerSessionEvent, PlayerSessionSummary } from '@core/api/models/ps2/character.model';
import { CharacterRepository } from '@core/api/ps2/character.repository';
import { PlanetsidePlayerStatsRecentSessionsCardComponent } from './planetside-player-stats-recent-sessions-card.component';

describe('PlanetsidePlayerStatsRecentSessionsCardComponent', () => {
    const summary = (id: number, day: number): PlayerSessionSummary => ({
        id,
        loginDate: `2025-09-${String(day).padStart(2, '0')}T20:00:00Z`,
        logoutDate: `2025-09-${String(day).padStart(2, '0')}T22:00:00Z`,
        duration: 2 * 3600000
    });

    const death = (attacker: string, attackerFaction: number, victim: string, victimFaction: number): PlayerSessionEvent => ({
        eventType: 'Death',
        timestamp: '2025-09-01T20:30:00Z',
        attacker: { id: attacker, factionId: attackerFaction },
        victim: { id: victim, factionId: victimFaction },
        isHeadshot: false
    });

    const render = (getSession: (characterId: string, sessionId: number | string) => unknown) => {
        const sessions = [1, 2, 3, 4, 5, 6, 7].map(id => summary(id, id));
        TestBed.configureTestingModule({
            providers: [provideRouter([]), { provide: CharacterRepository, useValue: { getSessions: () => of(sessions), getSession } }]
        });
        const fixture = TestBed.createComponent(PlanetsidePlayerStatsRecentSessionsCardComponent);
        fixture.componentRef.setInput('player', { id: 'me' } as CharacterDetails);
        fixture.detectChanges();
        return fixture;
    };

    it('loads the five newest sessions and shows their kills and K/D', () => {
        const requested: (number | string)[] = [];
        const fixture = render((_id, sessionId) => {
            requested.push(sessionId);
            const session: PlayerSession = {
                events: [
                    death('me', 1, 'a', 2), death('me', 1, 'b', 2), death('me', 1, 'c', 2), death('me', 1, 'd', 2),
                    death('me', 1, 'ally', 1), death('me', 1, 'me', 1),
                    death('x', 2, 'me', 1), death('y', 2, 'me', 1)
                ]
            };
            return of(session);
        });

        expect(requested).toEqual([7, 6, 5, 4, 3]);
        const rows = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('tbody tr'));
        expect(rows.length).toBe(5);
        const cells = Array.from<HTMLElement>(rows[0].querySelectorAll('td')).map(c => c.textContent.trim());
        expect(cells[1]).toBe('4');
        expect(cells[2]).toBe('1.33');
        expect(cells[3]).toBe('2.0h');
        expect(rows[0].querySelector('a').getAttribute('href')).toBe('/ps2/player/me/sessions/7');
        expect(fixture.nativeElement.querySelector('th:nth-child(2)').textContent).toContain('Kills');
        const headers = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('th')).map(h => h.textContent.trim());
        expect(headers).toEqual(['Date / Time', 'Kills', 'K/D', 'Duration']);
    });

    it('shows a dash when a session cannot be loaded', () => {
        const fixture = render(() => throwError(() => new Error('nope')));

        const cells = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('tbody tr')[0].querySelectorAll('td')).map(c => c.textContent.trim());
        expect(cells[1]).toBe('\u2014');
        expect(cells[2]).toBe('\u2014');
    });
});
