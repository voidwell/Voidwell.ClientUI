import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PlatformStoreUpdate } from '@core/api/models/ps2/admin.model';
import { StoreRepository } from '@core/api/ps2/store.repository';
import { StoresComponent } from './stores.component';

const store = (platform: PlatformStoreUpdate['platform'], storeName: string, updateInterval: string, lastUpdated?: string): PlatformStoreUpdate =>
    ({ platform, storeName, updateInterval, lastUpdated });
const STORES = [
    store('pc', 'Vehicle', '1.00:00:00', '2026-10-25T04:00:00Z'),
    store('pc', 'Item', '06:00:00', '2026-10-26T10:00:00Z'),
    store('pc', 'Weapon stats', '00:30:00'),
    store('ps4us', 'Item', '1.00:00:00', '2026-10-25T04:00:00Z')
];

function create(repository: Partial<StoreRepository> = {}, stores = STORES) {
    TestBed.configureTestingModule({
        providers: [{ provide: StoreRepository, useValue: { getUpdateLog: () => of(stores), forceUpdate: vi.fn(), ...repository } }]
    });
    const fixture = TestBed.createComponent(StoresComponent);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
}

const sections = (el: HTMLElement) => [...el.querySelectorAll('vw-platform-section')];
const names = (section: Element) => [...section.querySelectorAll('tbody tr:not(.stat-detail)')].map(row => row.querySelector('td')?.textContent?.trim());
const cells = (row: Element) => [...row.querySelectorAll('td')].slice(1, 3).map(td => td.textContent?.trim());

describe('StoresComponent', () => {
    it('lists the stores of each platform in its own collapsible section, sorted by name, with the interval in words', () => {
        const { el } = create();

        expect(sections(el).map(section => section.querySelector('.platform-section-count')?.textContent?.trim())).toEqual(['3', '1']);
        expect(names(sections(el)[0])).toEqual(['Item', 'Vehicle', 'Weapon stats']);
        expect(cells(sections(el)[0].querySelectorAll('tbody tr')[0])[0]).toBe('6 hours');
        expect(cells(sections(el)[0].querySelectorAll('tbody tr')[1])[0]).toBe('1 day');
    });

    it('shows a dash for a store that has never updated, and sorts it last', () => {
        const { fixture, el } = create();
        const [pc] = sections(el);

        expect(cells(pc.querySelectorAll('tbody tr')[2])[1]).toBe('—');

        (pc.querySelector('th[mat-sort-header="lastUpdated"]') as HTMLElement).click();
        fixture.detectChanges();
        expect(names(sections(el)[0])).toEqual(['Item', 'Vehicle', 'Weapon stats']);
    });

    it('sorts every platform by the interval', () => {
        const { fixture, el } = create();

        (el.querySelector('th[mat-sort-header="updateInterval"]') as HTMLElement).click();
        fixture.detectChanges();

        expect(names(sections(el)[0])).toEqual(['Weapon stats', 'Item', 'Vehicle']);
    });

    it('only offers a filter for a long list, and filters by name or platform', () => {
        expect(create().el.querySelector('.stat-search')).toBeNull();
        TestBed.resetTestingModule();

        const many = Array.from({ length: 12 }, (_, i) => store(i < 6 ? 'pc' : 'ps4eu', `Store ${i}`, '01:00:00'));
        const { fixture, el } = create({}, many);
        const input = el.querySelector('.stat-search input') as HTMLInputElement;

        input.value = 'store 1';
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(sections(el).map(names)).toEqual([['Store 1'], ['Store 10', 'Store 11']]);

        input.value = 'nothing';
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(el.textContent).toContain('No stores match.');
    });

    it('refreshes a store and shows its new update time', () => {
        const forceUpdate = vi.fn(() => of({ storeName: 'Weapon stats', updateInterval: '00:30:00', lastUpdated: '2026-10-26T12:00:00Z' }));
        const { fixture, el } = create({ forceUpdate } as unknown as Partial<StoreRepository>);
        const row = sections(el)[0].querySelectorAll('tbody tr')[2];

        (row.querySelector('button.refresh') as HTMLElement).click();
        fixture.detectChanges();

        expect(forceUpdate).toHaveBeenCalledWith('Weapon stats', 'pc');
        expect(cells(sections(el)[0].querySelectorAll('tbody tr')[2])[1]).toContain('Oct 26, 2026');
    });

    it('shows the error card when the stores fail to load', () => {
        const { el } = create({ getUpdateLog: () => throwError(() => new Error('nope')) });

        expect(el.querySelector('vw-error-card')).not.toBeNull();
    });
});
