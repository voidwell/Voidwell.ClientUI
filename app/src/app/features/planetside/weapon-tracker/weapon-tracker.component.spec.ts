import { TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { OracleRepository } from '@core/api/ps2/oracle.repository';
import { OracleStatsByWeapon } from '@core/api/models/ps2/weapon.model';
import { WeaponTrackerComponent } from './weapon-tracker.component';

const WEAPONS = [{ id: 1894, name: 'NS-15M' }, { id: 7210, name: 'Gauss SAW' }, { id: 43, name: 'T9 CARV' }];

const day = 86400000;
const points = (values: number[]) => values.map((value, i) => ({ period: new Date(Date.UTC(2026, 9, 1) + i * day).toISOString(), value }));
const STATS: OracleStatsByWeapon = {
    1894: points([10, 20, 15]),
    7210: points([50, 40, 45]),
    43: points([5, 8, 6])
};

function create(inputs: Record<string, string> = {}, repository: Partial<OracleRepository> = {}) {
    TestBed.configureTestingModule({
        providers: [
            provideRouter([]),
            provideNativeDateAdapter(),
            { provide: OracleRepository, useValue: { getCategoryWeapons: () => of(WEAPONS), getStats: () => of(STATS), ...repository } }
        ]
    });
    const fixture = TestBed.createComponent(WeaponTrackerComponent);
    for (const [name, value] of Object.entries(inputs)) {
        fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    return fixture;
}

const text = (el: HTMLElement, selector: string) => el.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();
const names = (el: HTMLElement) => [...el.querySelectorAll('tbody tr')].map(row => row.querySelector('td')?.textContent?.replace(/\s+/g, ' ').trim());

describe('WeaponTrackerComponent', () => {
    it('asks for a category before it lists any weapons, and has nothing to chart', () => {
        const el: HTMLElement = create().nativeElement;

        expect(el.textContent).toContain('Pick a category to choose its weapons.');
        expect(el.textContent).toContain('Choose weapons above and press Plot.');
        expect(el.querySelector('table')).toBeNull();
        expect(el.querySelector('.range-bar')?.hasAttribute('hidden')).toBe(true);
    });

    it('plots the weapons named in the address and lists each with its latest and highest value', () => {
        const fixture = create({ stat: 'kills', category: 'assault-rifles', weapons: '1894,7210,43' });
        const el: HTMLElement = fixture.nativeElement;

        expect(text(el, 'mat-card:nth-of-type(2) mat-card-title')).toContain('Kills');
        expect(text(el, 'mat-card:nth-of-type(2) mat-card-title')).toContain('Assault Rifles');
        expect(names(el)).toEqual(['Gauss SAW 7210', 'NS-15M 1894', 'T9 CARV 43']);
        expect([...el.querySelectorAll('tbody tr')[0].querySelectorAll('td')].slice(1).map(td => td.textContent?.trim())).toEqual(['45', '50']);
        expect(el.querySelectorAll('.chart-area svg').length).toBe(1);
        expect(el.querySelector('.range-bar')?.hasAttribute('hidden')).toBe(false);
        expect(text(el, '.hint')).toBe('3 weapons selected');
    });

    it('gives each weapon its line colour in the picker and the table', () => {
        const el: HTMLElement = create({ stat: 'kills', category: 'assault-rifles', weapons: '1894,7210' }).nativeElement;
        const chips = [...el.querySelectorAll('mat-chip-row .swatch')] as HTMLElement[];
        const rows = [...el.querySelectorAll('tbody .swatch')] as HTMLElement[];

        expect(chips.map(c => c.style.background)).toEqual(['rgb(31, 119, 180)', 'rgb(174, 199, 232)']);
        expect(rows.map(r => r.style.background).sort()).toEqual(['rgb(174, 199, 232)', 'rgb(31, 119, 180)'].sort());
    });

    it('sorts the table by a column header', () => {
        const fixture = create({ stat: 'kills', category: 'assault-rifles', weapons: '1894,7210,43' });
        const el: HTMLElement = fixture.nativeElement;

        (el.querySelector('th[mat-sort-header="name"]') as HTMLElement).click();
        fixture.detectChanges();

        expect(names(el)).toEqual(['Gauss SAW 7210', 'NS-15M 1894', 'T9 CARV 43']);

        (el.querySelector('th[mat-sort-header="peak"]') as HTMLElement).click();
        fixture.detectChanges();

        expect(names(el)[0]).toBe('Gauss SAW 7210');
    });

    it('shows a dash for a weapon with no data', () => {
        const el: HTMLElement = create({ stat: 'kills', category: 'assault-rifles', weapons: '1894,43' }, { getStats: () => of({ 1894: STATS[1894] }) }).nativeElement;
        const row = [...el.querySelectorAll('tbody tr')].find(r => r.textContent?.includes('T9 CARV'))!;

        expect([...row.querySelectorAll('td')].slice(1).map(td => td.textContent?.trim())).toEqual(['—', '—']);
    });

    it('marks a zoom range as picked, and clears it when the dates are changed', () => {
        const fixture = create({ stat: 'kills', category: 'assault-rifles', weapons: '1894' });
        const el: HTMLElement = fixture.nativeElement;
        const chips = () => [...el.querySelectorAll('.ranges .stat-chip')] as HTMLButtonElement[];

        chips()[2].click();
        fixture.detectChanges();
        expect(chips().map(c => c.classList.contains('on'))).toEqual([false, false, true, false, false, false]);

        fixture.componentInstance.onDateChange();
        fixture.detectChanges();
        expect(chips().some(c => c.classList.contains('on'))).toBe(false);
    });

    it('says the chart is out of date once the weapons change', () => {
        const fixture = create({ stat: 'kills', category: 'assault-rifles', weapons: '1894,7210' });
        const el: HTMLElement = fixture.nativeElement;

        fixture.componentInstance.onRemoveSelectedWeapon(fixture.componentInstance.selectedWeapons[0]);
        fixture.detectChanges();

        expect(text(el, '.hint')).toBe('The weapons have changed. Press Plot to update the chart.');
    });

    it('shows the error when the stats fail to load', () => {
        const el: HTMLElement = create({ stat: 'kills', category: 'assault-rifles', weapons: '1894' }, { getStats: () => throwError(() => new Error('nope')) }).nativeElement;

        expect(el.querySelector('.error-text')).not.toBeNull();
        expect(el.querySelector('table')).toBeNull();
    });
});
