import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CharacterRepository } from '@core/api/ps2/character.repository';
import { SimpleCharacterDetails } from '@core/api/models/ps2/character.model';
import { BulkCharacterStatsComponent } from './bulk-character-stats.component';

const character = (overrides: Partial<SimpleCharacterDetails>): SimpleCharacterDetails => ({
    id: '1', name: 'Wakeful', world: 'Osprey', factionId: 1, battleRank: 100, outfitAlias: 'VOID',
    kills: 200, deaths: 100, playTime: 0, totalPlayTimeMinutes: 120, score: 0, killDeathRatio: 2, headshotRatio: 0.25, killsPerHour: 100,
    ...overrides
});
const CHARACTERS = [
    character({}),
    character({ id: '2', name: 'Pyrrhic', factionId: 2, outfitAlias: undefined, kills: 900, world: 'SolTech' }),
    character({ id: '3', name: 'Idle', factionId: 3, outfitAlias: undefined, kills: 0, deaths: 0, totalPlayTimeMinutes: 0, killsPerHour: 0 })
];

function create(inputs: Record<string, string> = {}, repository: Partial<CharacterRepository> = {}) {
    TestBed.configureTestingModule({
        providers: [
            provideRouter([]),
            { provide: CharacterRepository, useValue: { getCharactersByName: () => of(CHARACTERS), ...repository } }
        ]
    });
    const fixture = TestBed.createComponent(BulkCharacterStatsComponent);
    for (const [name, value] of Object.entries(inputs)) {
        fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    return fixture;
}

const rowsOf = (el: HTMLElement) => [...el.querySelectorAll('tbody tr:not(.stat-detail)')];
const names = (el: HTMLElement) => rowsOf(el).map(row => row.querySelector('td')?.textContent?.replace(/\s+/g, ' ').trim());
const cells = (row: Element) => [...row.querySelectorAll('td')].slice(1).map(td => td.textContent?.trim());

describe('BulkCharacterStatsComponent', () => {
    it('asks for names before it has anything to show', () => {
        const el: HTMLElement = create().nativeElement;

        expect(el.textContent).toContain('Up to 25 players at a time.');
        expect(el.textContent).toContain('Add the players above and press Look up.');
        expect(el.querySelector('table')).toBeNull();
        expect(el.querySelector('button[mat-flat-button]')?.hasAttribute('disabled')).toBe(true);
    });

    it('lists the names in the address as chips, and looks them up', () => {
        const el: HTMLElement = create({ names: 'Wakeful,Pyrrhic' }).nativeElement;

        expect(el.querySelector('table')).not.toBeNull();
        expect([...el.querySelectorAll('mat-chip-row')].map(chip => chip.textContent?.replace(/\s+/g, ' ').trim().replace(/ ?mdi-close-circle$/, ''))).toEqual(['Wakeful', 'Pyrrhic']);
        expect(el.querySelector('.stat-hint')?.textContent?.trim()).toBe('2 of 25 players');
    });

    it('looks the names up and lists them by kills, with the outfit tag and dashes for what has no value', () => {
        const fixture = create({ names: 'Wakeful,Pyrrhic,Idle' });
        (fixture.nativeElement.querySelector('button[mat-flat-button]') as HTMLElement).click();
        fixture.detectChanges();
        const el: HTMLElement = fixture.nativeElement;

        expect(names(el)).toEqual(['Pyrrhic', '[VOID] Wakeful', 'Idle']);
        expect(cells(rowsOf(el)[1])).toEqual(['Osprey', '100', '2.0', '200', '2.00', '25.0%', '100.0']);
        expect(cells(rowsOf(el)[2])).toEqual(['Osprey', '100', '0.0', '0', '—', '—', '—']);
        expect(el.textContent).not.toContain('Not found');
    });

    it('names the players it could not find', () => {
        const fixture = create({ names: 'Wakeful,Typo,Pyrrhic,Idle' });
        (fixture.nativeElement.querySelector('button[mat-flat-button]') as HTMLElement).click();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('p.stat-hint strong')?.parentElement?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Not found: Typo');
    });

    it('sorts the table by a column header, and opens a row for what is hidden on a phone', () => {
        const fixture = create({ names: 'Wakeful,Pyrrhic,Idle' });
        (fixture.nativeElement.querySelector('button[mat-flat-button]') as HTMLElement).click();
        fixture.detectChanges();
        const el: HTMLElement = fixture.nativeElement;

        (el.querySelector('th[mat-sort-header="name"]') as HTMLElement).click();
        fixture.detectChanges();
        expect(names(el)).toEqual(['Idle', 'Pyrrhic', '[VOID] Wakeful']);

        (el.querySelector('.stat-expand') as HTMLElement).click();
        fixture.detectChanges();
        expect([...el.querySelectorAll('.stat-detail li')].map(li => li.textContent?.replace(/\s+/g, ' ').trim())).toEqual(['ServerOsprey', 'Battle rank100', 'Headshot ratio—', 'Kills per hour—']);
    });

    it('says when nothing was found, and shows the error when the lookup fails', () => {
        const none = create({ names: 'Typo' }, { getCharactersByName: () => of([]) });
        (none.nativeElement.querySelector('button[mat-flat-button]') as HTMLElement).click();
        none.detectChanges();
        expect(none.nativeElement.textContent).toContain('No players found.');
        TestBed.resetTestingModule();

        const failed = create({ names: 'Typo' }, { getCharactersByName: () => throwError(() => new Error('nope')) });
        (failed.nativeElement.querySelector('button[mat-flat-button]') as HTMLElement).click();
        failed.detectChanges();
        expect(failed.nativeElement.querySelector('.error-text')).not.toBeNull();
        expect(failed.nativeElement.querySelector('table')).toBeNull();
    });
});
