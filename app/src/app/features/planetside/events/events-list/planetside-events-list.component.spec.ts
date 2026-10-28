import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { CustomEvent } from '@core/api/models/platform/custom-event.model';
import { CustomEventRepository } from '@core/api/platform/custom-event.repository';
import { WorldService } from '../../data/world.service';
import { ZoneService } from '../../data/zone.service';
import { PlanetsideEventsListComponent } from './planetside-events-list.component';

const minutes = (n: number) => new Date(Date.now() + n * 60000).toISOString();

const event = (id: number, name: string, startMinutes: number, endMinutes: number, extra: Partial<CustomEvent> = {}): CustomEvent => ({
    id, name, serverId: '17', mapId: '2', startDate: minutes(startMinutes), endDate: minutes(endMinutes), isPrivate: false, gameId: 'ps2', teams: [], ...extra
});

function create(events: Observable<CustomEvent[]>) {
    TestBed.configureTestingModule({
        providers: [
            provideRouter([]),
            { provide: CustomEventRepository, useValue: { getEventsByGame: () => events } },
            { provide: WorldService, useValue: { worlds: signal([{ id: 17, name: 'Emerald', isActive: true }]) } },
            { provide: ZoneService, useValue: { zoneName: (): string => 'Indar' } }
        ]
    });
    const fixture = TestBed.createComponent(PlanetsideEventsListComponent);
    // A running event's countdown ticks on a timer, so the zone never settles: render without waiting for it
    fixture.detectChanges();
    return fixture;
}

const names = (el: HTMLElement) => [...el.querySelectorAll('tbody tr:not(.stat-detail)')].map(row => row.querySelector('td')?.textContent?.trim());

describe('PlanetsideEventsListComponent', () => {
    it('lists the running events in a card with their teams, and the finished ones in a table, the newest first', () => {
        const fixture = create(of([
            event(1, 'Running', -10, 80, { teams: [{ teamId: 'b', name: 'Goon Squad' }, { teamId: 'a', name: 'Voidwell Veterans' }] }),
            event(2, 'Older', -3000, -2900),
            event(3, 'Newer', -1000, -900)
        ]));
        const el: HTMLElement = fixture.nativeElement;

        expect(el.querySelector('.stat-feed a.stat-link')?.textContent).toContain('Running');
        expect([...el.querySelectorAll('.stat-feed .stat-pill:not(.amber)')].map(p => p.textContent?.trim())).toEqual(['Voidwell Veterans', 'Goon Squad']);
        expect(el.querySelector('.stat-feed')?.textContent).toContain('Emerald · Indar');
        expect(names(el)).toEqual(['Newer', 'Older']);
    });

    it('says so when no event is running', () => {
        const fixture = create(of([event(2, 'Older', -3000, -2900)]));

        expect(fixture.nativeElement.textContent).toContain('No events in progress');
    });

    it('shows the server, map and teams of a finished event, with dashes when there are none', () => {
        const fixture = create(of([
            event(2, 'With teams', -3000, -2900, { teams: [{ teamId: 'a', name: 'Alpha' }] }),
            event(3, 'No teams', -4000, -3900, { serverId: undefined, mapId: undefined })
        ]));
        const rows = [...fixture.nativeElement.querySelectorAll('tbody tr:not(.stat-detail)')] as HTMLElement[];
        const cells = (row: HTMLElement) => [...row.querySelectorAll('td')].map(td => td.textContent?.replace(/\s+/g, ' ').trim());

        expect(cells(rows[0])).toEqual(['With teams', 'Emerald', 'Indar', expect.any(String), 'Alpha']);
        expect(cells(rows[1]).slice(1, 3)).toEqual(['—', '—']);
        expect(cells(rows[1])[4]).toBe('—');
    });

    it('sorts by a column header', () => {
        const fixture = create(of([event(2, 'Bravo', -3000, -2900), event(3, 'Alpha', -1000, -900)]));
        const el: HTMLElement = fixture.nativeElement;

        (el.querySelector('th[mat-sort-header="name"]') as HTMLElement).click();
        fixture.detectChanges();

        expect(names(el)).toEqual(['Alpha', 'Bravo']);
    });

    it('opens a row on a phone to show the hidden columns', () => {
        const fixture = create(of([event(2, 'Older', -3000, -2900, { teams: [{ teamId: 'a', name: 'Alpha' }] })]));
        const el: HTMLElement = fixture.nativeElement;

        (el.querySelector('.stat-expand') as HTMLButtonElement).click();
        fixture.detectChanges();

        expect(el.querySelector('.stat-detail')?.textContent).toContain('Alpha');
    });

    it('shows the error card when the events fail to load', () => {
        const fixture = create(throwError(() => new Error('nope')));

        expect(fixture.nativeElement.querySelector('vw-error-card')).not.toBeNull();
    });
});
