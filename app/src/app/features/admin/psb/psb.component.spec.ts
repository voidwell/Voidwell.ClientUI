import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CharacterLastSession } from '@core/api/models/ps2/admin.model';
import { PsbUtilityRepository } from '@core/api/ps2/psb-utility.repository';
import { PsbComponent } from './psb.component';

const session = (id: number, name: string, loginDate: string, minutes: number): CharacterLastSession =>
    ({ characterId: String(5000 + id), name, sessionId: id * 1000, loginDate, logoutDate: loginDate, duration: minutes * 60000 });
const SESSIONS = [
    session(1, 'Wakeful', '2026-10-25T20:14:00Z', 154),
    session(2, 'Pyrrhic', '2026-10-25T19:02:00Z', 38),
    session(3, 'NoOutfitNick', '2026-10-24T18:30:00Z', 155)
];

function create(sessions: CharacterLastSession[] | Error = SESSIONS) {
    const getLastOnlineSessions = vi.fn(() => (sessions instanceof Error ? throwError(() => sessions) : of(sessions)));
    TestBed.configureTestingModule({
        providers: [provideRouter([]), { provide: PsbUtilityRepository, useValue: { getLastOnlineSessions } }]
    });
    const fixture = TestBed.createComponent(PsbComponent);
    fixture.detectChanges();
    const load = () => {
        (fixture.nativeElement.querySelector('button.load') as HTMLElement).click();
        fixture.detectChanges();
    };
    return { fixture, el: fixture.nativeElement as HTMLElement, getLastOnlineSessions, load };
}

const rows = (el: HTMLElement) => [...el.querySelectorAll('tbody tr:not(.stat-detail)')];
const names = (el: HTMLElement) => rows(el).map(row => row.querySelector('td')?.textContent?.trim());

describe('PsbComponent', () => {
    it('waits for the accounts to be loaded, without asking for them', () => {
        const { el, getLastOnlineSessions } = create();

        expect(getLastOnlineSessions).not.toHaveBeenCalled();
        expect(el.textContent).toContain('Load the accounts to see when they last played.');
        expect(el.querySelector('table')).toBeNull();
    });

    it('lists the accounts once loaded, the latest login first, with the minutes and a link to each session', () => {
        const { el, load } = create();
        load();

        expect(names(el)).toEqual(['Wakeful', 'Pyrrhic', 'NoOutfitNick']);
        expect([...rows(el)[0].querySelectorAll('td')].slice(1).map(td => td.textContent?.trim())).toEqual(['2026-10-25 20:14', '2026-10-25 20:14', '154', '#1000']);
        expect(rows(el)[0].querySelector('a[href$="/sessions/1000"]')).not.toBeNull();
        expect(el.querySelector('button.load')).toBeNull();
    });

    it('sorts by a column header', () => {
        const { fixture, el, load } = create();
        load();

        (el.querySelector('th[mat-sort-header="minutes"]') as HTMLElement).click();
        fixture.detectChanges();

        expect(names(el)).toEqual(['NoOutfitNick', 'Wakeful', 'Pyrrhic']);
    });

    it('pages a long list, and filters it by name or character id', () => {
        const many = Array.from({ length: 120 }, (_, i) => session(i, `Player${i}`, new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString(), 10));
        const { fixture, el, load } = create(many);
        load();

        expect(rows(el)).toHaveLength(50);
        expect(el.querySelector('.stat-pager')?.textContent?.replace(/\s+/g, ' ')).toContain('Accounts 1–50 of 120');

        const input = el.querySelector('.stat-search input') as HTMLInputElement;
        input.value = 'player11';
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(names(el)).toEqual(['Player119', 'Player118', 'Player117', 'Player116', 'Player115', 'Player114', 'Player113', 'Player112', 'Player111', 'Player110', 'Player11']);

        input.value = '5042';
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(names(el)).toEqual(['Player42']);

        input.value = 'nobody';
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(el.textContent).toContain('No accounts match.');
    });

    it('opens a row to show what is hidden on a phone', () => {
        const { fixture, el, load } = create();
        load();

        (el.querySelector('.stat-expand') as HTMLElement).click();
        fixture.detectChanges();

        expect([...el.querySelectorAll('.stat-detail li')].map(li => li.textContent?.replace(/\s+/g, ' ').trim())).toEqual(['Logout (UTC)2026-10-25 20:14', 'Session#1000']);
    });

    it('shows the error card when the accounts fail to load, and lets them be loaded again', () => {
        const { el, load } = create(new Error('nope'));
        load();

        expect(el.querySelector('vw-error-card')).not.toBeNull();
        expect(el.querySelector('button.load')).not.toBeNull();
    });
});
