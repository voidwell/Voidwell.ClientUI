import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { DailyPopulation, World, WorldPopulationHistory } from '@core/api/models/ps2/world.model';
import { WorldRepository } from '@core/api/ps2/world.repository';
import { WorldService } from '../data/world.service';
import { PopulationComponent } from './population.component';

const WORLDS: World[] = [
    { id: 17, name: 'Osprey', isActive: true },
    { id: 40, name: 'Wainwright', isActive: true },
    { id: 1, name: 'Connery', isActive: true }
];

const dayMs = 86400000;
const days = (counts: number[][]): DailyPopulation[] => counts.map(([vs, nc, tr, ns], i) => ({
    date: new Date(Date.UTC(2026, 9, 1) + i * dayMs).toISOString(), worldId: 0, vsCount: vs, ncCount: nc, trCount: tr, nsCount: ns,
    vsAvgPlayTime: 0, ncAvgPlayTime: 0, trAvgPlayTime: 0, nsAvgPlayTime: 0, avgPlayTime: 0
}));
const HISTORY: WorldPopulationHistory = {
    17: days([[100, 100, 100, 10], [200, 150, 120, 20], [150, 140, 130, 15]]),
    40: days([[20, 20, 20, 2], [30, 30, 30, 3], [10, 10, 10, 1]])
};

function create(inputs: Record<string, string> = {}, repository: Partial<WorldRepository> = {}) {
    TestBed.configureTestingModule({
        providers: [
            provideRouter([]),
            provideNativeDateAdapter(),
            { provide: WorldService, useValue: { worlds: signal(WORLDS) } },
            { provide: WorldRepository, useValue: { getPopulationHistory: () => of(HISTORY), ...repository } }
        ]
    });
    const fixture = TestBed.createComponent(PopulationComponent);
    for (const [name, value] of Object.entries(inputs)) {
        fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    return fixture;
}

const text = (el: HTMLElement, selector: string) => el.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();
const names = (el: HTMLElement) => [...el.querySelectorAll('tbody tr:not(.stat-detail)')].map(row => row.querySelector('td')?.textContent?.replace(/\s+/g, ' ').trim());
const cells = (row: Element) => [...row.querySelectorAll('td')].slice(1).map(td => td.textContent?.trim());

describe('PopulationComponent', () => {
    it('lists the servers to pick from, and has nothing to chart', () => {
        const el: HTMLElement = create().nativeElement;

        expect([...el.querySelectorAll('.servers .stat-chip')].map(chip => chip.textContent?.trim())).toEqual(['Osprey', 'Wainwright', 'Connery']);
        expect(text(el, '.hint')).toBe('Pick the servers to compare.');
        expect(el.textContent).toContain('Choose servers above and press Plot.');
        expect(el.querySelector('table')).toBeNull();
        expect(el.querySelector('.range-bar')?.hasAttribute('hidden')).toBe(true);
        expect(el.querySelector('button[mat-flat-button]')?.hasAttribute('disabled')).toBe(true);
    });

    it('plots the servers named in the address and lists each with its latest day and peak', () => {
        const fixture = create({ worlds: '17,40' });
        const el: HTMLElement = fixture.nativeElement;
        const rows = el.querySelectorAll('tbody tr:not(.stat-detail)');

        expect(names(el)).toEqual(['Osprey', 'Wainwright']);
        expect(cells(rows[0])).toEqual(['150', '140', '130', '15', '435', '490']);
        expect(cells(rows[1])).toEqual(['10', '10', '10', '1', '31', '93']);
        expect(el.querySelectorAll('.chart-area svg').length).toBe(1);
        expect(el.querySelector('.range-bar')?.hasAttribute('hidden')).toBe(false);
        expect(text(el, '.hint')).toBe('2 servers selected');
    });

    it('gives each picked server its line colour on its chip and in the table', () => {
        const el: HTMLElement = create({ worlds: '17,40' }).nativeElement;
        const chips = [...el.querySelectorAll('.servers .swatch')] as HTMLElement[];
        const rows = [...el.querySelectorAll('tbody .swatch')] as HTMLElement[];

        expect(chips.map(c => c.style.background)).toEqual(['rgb(31, 119, 180)', 'rgb(174, 199, 232)']);
        expect(rows.map(r => r.style.background)).toEqual(['rgb(31, 119, 180)', 'rgb(174, 199, 232)']);
    });

    it('picks and drops a server with its chip, and says when the chart is out of date', () => {
        const fixture = create({ worlds: '17' });
        const el: HTMLElement = fixture.nativeElement;
        const chips = () => [...el.querySelectorAll('.servers .stat-chip')] as HTMLButtonElement[];

        chips()[1].click();
        fixture.detectChanges();
        expect(chips().map(c => c.getAttribute('aria-pressed'))).toEqual(['true', 'true', 'false']);
        expect(text(el, '.hint')).toBe('The servers have changed. Press Plot to update the chart.');

        chips()[1].click();
        fixture.detectChanges();
        expect(text(el, '.hint')).toBe('1 server selected');
    });

    it('sorts the table by a column header, and shows a dash for a server with no data', () => {
        const fixture = create({ worlds: '17,40,1' });
        const el: HTMLElement = fixture.nativeElement;

        expect(names(el)).toEqual(['Osprey', 'Wainwright', 'Connery']);
        expect(cells(el.querySelectorAll('tbody tr:not(.stat-detail)')[2])).toEqual(['—', '—', '—', '—', '—', '—']);

        (el.querySelector('th[mat-sort-header="name"]') as HTMLElement).click();
        fixture.detectChanges();
        expect(names(el)).toEqual(['Connery', 'Osprey', 'Wainwright']);

        ([...el.querySelectorAll('th')].find(th => th.textContent?.trim() === 'VS') as HTMLElement).click();
        fixture.detectChanges();
        expect(names(el)).toEqual(['Osprey', 'Wainwright', 'Connery']);
    });

    it('opens a row to show the factions', () => {
        const fixture = create({ worlds: '17' });
        const el: HTMLElement = fixture.nativeElement;

        (el.querySelector('.stat-expand') as HTMLElement).click();
        fixture.detectChanges();

        expect([...el.querySelectorAll('.stat-detail li')].map(li => li.textContent?.replace(/\s+/g, ' ').trim())).toEqual(['VS150', 'NC140', 'TR130', 'NS15']);
    });

    it('marks a zoom range as picked, and clears it when the dates are changed', () => {
        const fixture = create({ worlds: '17' });
        const el: HTMLElement = fixture.nativeElement;
        const chips = () => [...el.querySelectorAll('.ranges .stat-chip')] as HTMLButtonElement[];

        chips()[2].click();
        fixture.detectChanges();
        expect(chips().map(c => c.classList.contains('on'))).toEqual([false, false, true, false, false, false]);

        fixture.componentInstance.onDateChange();
        fixture.detectChanges();
        expect(chips().some(c => c.classList.contains('on'))).toBe(false);
    });

    it('shows the error when the history fails to load', () => {
        const el: HTMLElement = create({ worlds: '17' }, { getPopulationHistory: () => throwError(() => new Error('nope')) }).nativeElement;

        expect(el.querySelector('.error-text')).not.toBeNull();
        expect(el.querySelector('table')).toBeNull();
    });
});
