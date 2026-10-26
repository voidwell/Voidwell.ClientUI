import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { WorldOnlineState, WorldOnlineZoneState } from '@core/api/models/ps2/world-state.model';
import { WorldStateRepository } from '@core/api/ps2/world-state.repository';
import { ZoneService } from '../data/zone.service';
import { PlanetsideWorldWrapperComponent } from './planetside-world-wrapper.component';

const zone = (id: number, name: string, extra: Partial<WorldOnlineZoneState> = {}): WorldOnlineZoneState =>
    ({ id, name, isTracking: true, population: { vs: 1, nc: 2, tr: 3, ns: 4 }, ...extra });

const WORLDS: WorldOnlineState[] = [
    {
        id: 17, name: 'Emerald', isOnline: true, onlineCharacters: 30,
        zoneStates: [
            zone(2, 'Indar', { alertState: { timestamp: '2026-10-20T10:00:00Z', metagameEvent: { id: 1, typeId: 1 } } }),
            zone(4, 'Hossin', { lockState: { state: 'LOCKED', timestamp: '2026-10-20T10:00:00Z', triggeringFaction: 2 } }),
            zone(344, 'Oshur')
        ]
    },
    { id: 13, name: 'Cobalt', isOnline: true, onlineCharacters: 10, zoneStates: [zone(2, 'Indar')] },
    { id: 40, name: 'Soltech', isOnline: false, onlineCharacters: 0, zoneStates: [] }
];

function create(states: Observable<WorldOnlineState[]>) {
    TestBed.configureTestingModule({
        providers: [
            provideRouter([]),
            { provide: WorldStateRepository, useValue: { getWorldStates: () => states } },
            { provide: ZoneService, useValue: { zoneName: (): string | undefined => undefined } }
        ]
    });
    const fixture = TestBed.createComponent(PlanetsideWorldWrapperComponent);
    fixture.autoDetectChanges();
    return fixture;
}

describe('PlanetsideWorldWrapperComponent', () => {
    it('lists the servers by name with a column for every zone they report', async () => {
        const fixture = create(of(WORLDS));
        await fixture.whenStable();
        const el: HTMLElement = fixture.nativeElement;

        expect(fixture.componentInstance.rows().map(row => row.name)).toEqual(['Cobalt', 'Emerald', 'Soltech']);
        expect([...el.querySelectorAll('th.zone')].map(th => th.textContent?.trim())).toEqual(['Indar', 'Hossin', 'Oshur']);
        expect(el.textContent).toContain('40 players online across 2 servers');
    });

    it('marks running alerts and locks, and dashes what has no data', async () => {
        const fixture = create(of(WORLDS));
        await fixture.whenStable();
        const emerald = fixture.nativeElement.querySelectorAll('tbody tr:not(.stat-detail)')[1] as HTMLElement;
        const cells = emerald.querySelectorAll('td.zone');

        expect(cells[0].querySelector('vw-alert-indicator')).not.toBeNull();
        expect(cells[1].querySelector('.lock')?.classList).toContain('faction-nc-text');
        expect(cells[1].textContent).toContain('—');
        expect(cells[2].textContent?.trim()).toBe('10');

        const cobalt = fixture.nativeElement.querySelectorAll('tbody tr:not(.stat-detail)')[0] as HTMLElement;
        expect(cobalt.querySelectorAll('td.zone')[1].textContent?.trim()).toBe('—');
    });

    it('shows an offline server with dashes', async () => {
        const fixture = create(of(WORLDS));
        await fixture.whenStable();
        const soltech = fixture.nativeElement.querySelectorAll('tbody tr:not(.stat-detail)')[2] as HTMLElement;

        expect(soltech.querySelector('.stat-state')?.textContent?.trim()).toBe('Offline');
        expect([...soltech.querySelectorAll('td:not(.pinned):not(.status)')].every(td => td.textContent?.trim() === '—')).toBe(true);
    });

    it('opens and closes a server\'s zones', async () => {
        const fixture = create(of(WORLDS));
        await fixture.whenStable();
        const el: HTMLElement = fixture.nativeElement;
        const button = el.querySelector('button.stat-expand') as HTMLButtonElement;

        button.click();
        await fixture.whenStable();
        expect(el.querySelector('tr.stat-detail')).not.toBeNull();
        expect(button.getAttribute('aria-expanded')).toBe('true');

        button.click();
        await fixture.whenStable();
        expect(el.querySelector('tr.stat-detail')).toBeNull();
    });

    it('shows the error card when the servers fail to load', async () => {
        const fixture = create(throwError(() => new Error('nope')));
        await fixture.whenStable();

        expect(fixture.nativeElement.querySelector('vw-error-card')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('table')).toBeNull();
    });
});
