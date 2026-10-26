import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RankingsRepository } from '@core/api/ps2/rankings.repository';
import { RatingCharacter } from '@core/api/models/ps2/reference.model';
import { World } from '@core/api/models/ps2/world.model';
import { WorldService } from '../data/world.service';
import { PlayerRanksComponent } from './player-ranks.component';

const WORLDS: World[] = [{ id: 17, name: 'Osprey', isActive: true }, { id: 40, name: 'Wainwright', isActive: true }];
const many = (count: number): RatingCharacter[] => Array.from({ length: count }, (_, i) => ({
    characterId: String(i + 1), name: `Player${i + 1}`, factionId: (i % 3) + 1, worldId: 17, battleRank: 100, rating: 3000 - i, deviation: 40
}));

function create(players: RatingCharacter[], getPlayerRanks = () => of(players)) {
    TestBed.configureTestingModule({
        providers: [
            provideRouter([]),
            { provide: WorldService, useValue: { worlds: signal(WORLDS) } },
            { provide: RankingsRepository, useValue: { getPlayerRanks } }
        ]
    });
    const fixture = TestBed.createComponent(PlayerRanksComponent);
    fixture.detectChanges();
    return fixture;
}

const rowsOf = (el: HTMLElement) => [...el.querySelectorAll('tbody tr:not(.stat-detail)')];
const names = (el: HTMLElement) => rowsOf(el).map(row => row.querySelectorAll('td')[1].textContent?.trim());
const cells = (row: Element) => [...row.querySelectorAll('td')].map(td => td.textContent?.replace(/\s+/g, ' ').trim());

describe('PlayerRanksComponent', () => {
    it('lists the players by rating with their place, server and figures', () => {
        const el: HTMLElement = create([
            { characterId: '2', name: 'Second', factionId: 2, worldId: 40, battleRank: 118, rating: 2381.4, deviation: 44.2 },
            { characterId: '1', name: 'First', factionId: 1, worldId: 17, battleRank: 142, rating: 2412.6, deviation: 38 },
            { characterId: '3', name: 'Lost', factionId: 3, rating: 2000, deviation: 50 }
        ]).nativeElement;

        expect(names(el)).toEqual(['First', 'Second', 'Lost']);
        expect(cells(rowsOf(el)[0])).toEqual(['1', 'First', 'Osprey', '142', '2,413', '±38']);
        expect(cells(rowsOf(el)[2])).toEqual(['3', 'Lost', '—', '—', '2,000', '±50']);
        expect(el.querySelector('.stat-search')).toBeNull();
        expect(el.querySelector('.stat-pager')).toBeNull();
    });

    it('colours each name by its faction', () => {
        const el: HTMLElement = create(many(3)).nativeElement;

        expect([...el.querySelectorAll('tbody .stat-name')].map(a => a.className.match(/faction-\w+-text/)?.[0])).toEqual(['faction-vs-text', 'faction-nc-text', 'faction-tr-text']);
    });

    it('pages a long list, and filters it by name', () => {
        const fixture = create(many(120));
        const el: HTMLElement = fixture.nativeElement;

        expect(rowsOf(el)).toHaveLength(50);
        expect(el.querySelector('.stat-pager')?.textContent?.replace(/\s+/g, ' ')).toContain('Players 1–50 of 120');

        (el.querySelector('button[aria-label="Next page"]') as HTMLElement).click();
        fixture.detectChanges();
        expect(names(el)[0]).toBe('Player51');
        expect(el.querySelector('.stat-pager')?.textContent?.replace(/\s+/g, ' ')).toContain('Players 51–100 of 120');

        const input = el.querySelector('.stat-search input') as HTMLInputElement;
        input.value = 'player119';
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(names(el)).toEqual(['Player119']);
        expect(cells(rowsOf(el)[0])[0]).toBe('119');
        expect(el.querySelector('.stat-pager')).toBeNull();

        input.value = 'nobody';
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(el.textContent).toContain('No players match.');
    });

    it('sorts by a column header and goes back to the first page', () => {
        const fixture = create(many(120));
        const el: HTMLElement = fixture.nativeElement;

        (el.querySelector('button[aria-label="Next page"]') as HTMLElement).click();
        fixture.detectChanges();
        (el.querySelector('th[mat-sort-header="name"]') as HTMLElement).click();
        fixture.detectChanges();

        expect(names(el)[0]).toBe('Player1');
        expect(cells(rowsOf(el)[1])[0]).toBe('10');
    });

    it('opens a row to show what is hidden on a phone', () => {
        const fixture = create(many(2));
        const el: HTMLElement = fixture.nativeElement;

        (el.querySelector('.stat-expand') as HTMLElement).click();
        fixture.detectChanges();

        expect([...el.querySelectorAll('.stat-detail li')].map(li => li.textContent?.replace(/\s+/g, ' ').trim())).toEqual(['ServerOsprey', 'Battle rank100', 'Deviation±40']);
    });

    it('says when nobody is ranked, and shows the error card when the ranks fail to load', () => {
        expect(create([]).nativeElement.textContent).toContain('No players ranked yet.');
        TestBed.resetTestingModule();

        const el: HTMLElement = create([], () => throwError(() => new Error('nope'))).nativeElement;
        expect(el.querySelector('vw-error-card')).not.toBeNull();
        expect(el.querySelector('table')).toBeNull();
    });
});
