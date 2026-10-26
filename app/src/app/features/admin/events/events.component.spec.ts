import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CustomEvent } from '@core/api/models/platform/custom-event.model';
import { CustomEventRepository } from '@core/api/platform/custom-event.repository';
import { WorldRepository } from '@core/api/ps2/world.repository';
import { ZoneRepository } from '@core/api/ps2/zone.repository';
import { EventsComponent } from './events.component';

const event = (id: number, name: string, startDate: string, overrides: Partial<CustomEvent> = {}): CustomEvent =>
    ({ id, name, startDate, endDate: '2026-12-31T23:00:00Z', isPrivate: false, ...overrides });
const EVENTS = [
    event(1, 'Friday scrims', '2026-10-17T20:00:00Z', { serverId: '40' }),
    event(2, 'Finals', '2026-10-24T19:00:00Z', { serverId: '17', mapId: '2' }),
    event(3, 'Open tournament', '2026-09-05T18:00:00Z', { mapId: '99' })
];

function create(events: CustomEvent[] | Error = EVENTS, dialogResult?: CustomEvent) {
    const open = vi.fn(() => ({ afterClosed: () => of(dialogResult) }));
    TestBed.configureTestingModule({
        providers: [
            provideRouter([]),
            { provide: CustomEventRepository, useValue: { getEvents: () => (events instanceof Error ? throwError(() => events) : of(events)) } },
            { provide: WorldRepository, useValue: { getWorlds: () => of([{ id: 17, name: 'Osprey', isActive: true }, { id: 40, name: 'Wainwright', isActive: true }]) } },
            { provide: ZoneRepository, useValue: { getZones: () => of([{ id: 2, name: 'Indar' }]) } },
            { provide: MatDialog, useValue: { open } }
        ]
    });
    const fixture = TestBed.createComponent(EventsComponent);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement, open };
}

const rows = (el: HTMLElement) => [...el.querySelectorAll('tbody tr:not(.stat-detail)')];
const names = (el: HTMLElement) => rows(el).map(row => row.querySelector('td')?.textContent?.trim());
const cells = (row: Element) => [...row.querySelectorAll('td')].slice(1, 5).map(td => td.textContent?.trim());

describe('EventsComponent', () => {
    it('lists the events, the latest start first, with the server and map named where known', () => {
        const { el } = create();

        expect(names(el)).toEqual(['Finals', 'Friday scrims', 'Open tournament']);
        expect(cells(rows(el)[0]).slice(2)).toEqual(['Osprey', 'Indar']);
        expect(cells(rows(el)[1]).slice(2)).toEqual(['Wainwright', '—']);
        expect(cells(rows(el)[2]).slice(2)).toEqual(['—', '99']);
    });

    it('links each event to its stats', () => {
        const { el } = create();

        expect(el.querySelector('tbody a.stat-action')?.getAttribute('href')).toBe('/ps2/events/2');
    });

    it('sorts by a column header', () => {
        const { fixture, el } = create();

        (el.querySelector('th[mat-sort-header="name"]') as HTMLElement).click();
        fixture.detectChanges();

        expect(names(el)).toEqual(['Finals', 'Friday scrims', 'Open tournament']);

        (el.querySelector('th[mat-sort-header="name"]') as HTMLElement).click();
        fixture.detectChanges();
        expect(names(el)).toEqual(['Open tournament', 'Friday scrims', 'Finals']);
    });

    it('opens the editor for a new event, and adds the saved one', () => {
        const { fixture, el, open } = create(EVENTS, event(4, 'Late addition', '2026-10-30T20:00:00Z'));

        (el.querySelector('button.ml-auto') as HTMLElement).click();
        fixture.detectChanges();

        expect(open).toHaveBeenCalledWith(expect.anything(), { data: { event: null } });
        expect(names(el)[0]).toBe('Late addition');
    });

    it('opens the editor for an event, and replaces it with the saved one', () => {
        const { fixture, el, open } = create(EVENTS, event(2, 'Finals (moved)', '2026-10-24T19:00:00Z'));

        (el.querySelector('tbody button.stat-action') as HTMLElement).click();
        fixture.detectChanges();

        expect(open).toHaveBeenCalledWith(expect.anything(), { data: { event: EVENTS[1] } });
        expect(names(el)).toContain('Finals (moved)');
        expect(names(el)).not.toContain('Finals');
    });

    it('says when there are no events, and shows the error card when they fail to load', () => {
        expect(create([]).el.textContent).toContain('No events yet.');
        TestBed.resetTestingModule();

        const { el } = create(new Error('nope'));
        expect(el.querySelector('vw-error-card')).not.toBeNull();
        expect(el.querySelector('table')).toBeNull();
    });
});
