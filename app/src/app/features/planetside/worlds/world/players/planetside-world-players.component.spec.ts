import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, Subject, of, throwError } from 'rxjs';
import { OnlineCharacter } from '@core/api/models/ps2/character.model';
import { ZoneService } from '../../../data/zone.service';
import { PlanetsideWorldComponent } from '../planetside-world.component';
import { PlanetsideWorldPlayersComponent } from './planetside-world-players.component';

const player = (name: string, factionId: number, minutesAgo: number): OnlineCharacter => ({
    character: { characterId: name, name, factionId, worldId: 17 },
    lastSeen: { timestamp: new Date().toISOString(), zoneId: 2 },
    loginDate: new Date(Date.now() - minutesAgo * 60000).toISOString()
});

function create(players: Observable<OnlineCharacter[]>) {
    TestBed.configureTestingModule({
        providers: [
            provideRouter([]),
            { provide: PlanetsideWorldComponent, useValue: { getOnlinePlayers: () => players } },
            { provide: ZoneService, useValue: { zoneName: (): string => 'Indar' } }
        ]
    });
    const fixture = TestBed.createComponent(PlanetsideWorldPlayersComponent);
    fixture.autoDetectChanges();
    return fixture;
}

const names = (el: HTMLElement) => [...el.querySelectorAll('tbody tr')].map(row => row.querySelector('td')?.textContent?.trim());

describe('PlanetsideWorldPlayersComponent', () => {
    it('shows the online players once they arrive, the longest online first', async () => {
        const players = new Subject<OnlineCharacter[]>();
        const fixture = create(players);
        await fixture.whenStable();
        expect(fixture.nativeElement.querySelector('table')).toBeNull();

        players.next([player('Alpha', 1, 10), player('Bravo', 2, 90), player('Charlie', 3, 30)]);
        await fixture.whenStable();

        expect(names(fixture.nativeElement)).toEqual(['Bravo', 'Charlie', 'Alpha']);
        expect(fixture.nativeElement.textContent).toContain('Indar');
        expect(fixture.nativeElement.textContent).toContain('1 hour ago');
    });

    it('colours each name by faction', async () => {
        const fixture = create(of([player('Alpha', 1, 10), player('Bravo', 2, 20)]));
        await fixture.whenStable();
        const links = [...fixture.nativeElement.querySelectorAll('tbody a')] as HTMLElement[];

        expect(links.find(a => a.textContent?.trim() === 'Alpha')?.classList).toContain('faction-vs-text');
        expect(links.find(a => a.textContent?.trim() === 'Bravo')?.classList).toContain('faction-nc-text');
    });

    it('filters by faction chip and by name', async () => {
        const fixture = create(of([player('Alpha', 1, 10), player('Alphonse', 2, 20), player('Bravo', 2, 30)]));
        await fixture.whenStable();
        const el: HTMLElement = fixture.nativeElement;

        (el.querySelectorAll('.stat-chip')[2] as HTMLButtonElement).click();
        await fixture.whenStable();
        expect(names(el)).toEqual(['Bravo', 'Alphonse']);

        const input = el.querySelector('input[type=search]') as HTMLInputElement;
        input.value = 'alph';
        input.dispatchEvent(new Event('input'));
        await fixture.whenStable();
        expect(names(el)).toEqual(['Alphonse']);

        input.value = 'zzz';
        input.dispatchEvent(new Event('input'));
        await fixture.whenStable();
        expect(el.querySelector('table')).toBeNull();
        expect(el.textContent).toContain('No players match');
    });

    it('pages through a long list', async () => {
        const many = Array.from({ length: 30 }, (_, i) => player(`P${String(i).padStart(2, '0')}`, 1, i + 1));
        const fixture = create(of(many));
        await fixture.whenStable();
        const el: HTMLElement = fixture.nativeElement;

        expect(names(el)).toHaveLength(25);
        expect(el.querySelector('.stat-pager')?.textContent).toContain('1–25 of 30');

        (el.querySelectorAll('.stat-page-button')[1] as HTMLButtonElement).click();
        await fixture.whenStable();
        expect(names(el)).toHaveLength(5);
        expect(el.querySelector('.stat-pager')?.textContent).toContain('26–30 of 30');
        expect((el.querySelectorAll('.stat-page-button')[1] as HTMLButtonElement).disabled).toBe(true);
    });

    it('says so when no one is online', async () => {
        const fixture = create(of([]));
        await fixture.whenStable();

        expect(fixture.nativeElement.textContent).toContain('No one is online right now');
    });

    it('shows the error card when the players fail to load', async () => {
        const fixture = create(throwError(() => new Error('nope')));
        await fixture.whenStable();

        expect(fixture.nativeElement.querySelector('vw-error-card')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('table')).toBeNull();
    });
});
