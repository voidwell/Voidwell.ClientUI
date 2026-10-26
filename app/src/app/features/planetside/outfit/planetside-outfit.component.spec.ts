import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { OutfitDetails, OutfitMemberDetails } from '@core/api/models/ps2/outfit.model';
import { OutfitRepository } from '@core/api/ps2/outfit.repository';
import { PlanetsideOutfitComponent } from './planetside-outfit.component';

const outfit: OutfitDetails = {
    outfitId: '1', name: 'Test Outfit', factionId: 1, factionName: 'Vanu Sovereignty', worldName: 'Emerald', createdDate: '2020-01-01T00:00:00Z',
    memberCount: 4, trackedMemberCount: 3, activity7Days: 2, activity30Days: 3, activity90Days: 4
};

const member = (name: string, rankOrdinal: number, kills?: number): OutfitMemberDetails => ({
    characterId: name, name, rankOrdinal, rank: `Rank ${rankOrdinal}`, memberSinceDate: '2020-01-01T00:00:00Z', battleRank: 100 - rankOrdinal,
    lifetimeStats: kills === undefined ? undefined : { weaponKills: kills, weaponDeaths: 100, weaponScore: kills * 10, weaponPlayTime: 6000 }
});

describe('PlanetsideOutfitComponent', () => {
    const setup = () => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                { provide: OutfitRepository, useValue: {
                    getOutfit: () => of(outfit),
                    getMembers: () => of([member('Cara', 2, 300), member('Alice', 0, 100), member('Dev', 3), member('Bob', 1, 200)])
                } }
            ]
        });
        const fixture = TestBed.createComponent(PlanetsideOutfitComponent);
        fixture.componentRef.setInput('id', '1');
        fixture.detectChanges();
        return { fixture, element: fixture.nativeElement as HTMLElement };
    };
    const names = (element: HTMLElement) => Array.from(element.querySelectorAll('td.pinned')).map(e => e.textContent?.trim());
    const click = (fixture: ReturnType<typeof setup>['fixture'], column: string) => {
        (fixture.nativeElement.querySelector(`th[mat-sort-header="${column}"]`) as HTMLElement).click();
        fixture.detectChanges();
    };

    it('lists the leader first by default', () => {
        const { element } = setup();

        expect(names(element)).toEqual(['Alice', 'Bob', 'Cara', 'Dev']);
    });

    it('sorts a figure from high to low on the first click, then low to high, with missing figures last', () => {
        const { fixture, element } = setup();

        click(fixture, 'kdr');
        expect(names(element)).toEqual(['Cara', 'Bob', 'Alice', 'Dev']);

        click(fixture, 'kdr');
        expect(names(element)).toEqual(['Alice', 'Bob', 'Cara', 'Dev']);
    });

    it('sorts names from A to Z on the first click', () => {
        const { fixture, element } = setup();

        click(fixture, 'name');
        expect(names(element)).toEqual(['Alice', 'Bob', 'Cara', 'Dev']);

        click(fixture, 'name');
        expect(names(element)).toEqual(['Dev', 'Cara', 'Bob', 'Alice']);
    });

    it('filters the roster by name and by untracked members', () => {
        const { fixture, element } = setup();

        const search = element.querySelector('.stat-search input') as HTMLInputElement;
        search.value = 'b';
        search.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(names(element)).toEqual(['Bob']);

        search.value = '';
        search.dispatchEvent(new Event('input'));
        (Array.from(element.querySelectorAll('.stat-chip')).find(chip => chip.textContent?.includes('Untracked')) as HTMLElement).click();
        fixture.detectChanges();
        expect(names(element)).toEqual(['Dev']);
    });
});
