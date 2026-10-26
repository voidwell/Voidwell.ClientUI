import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { Alert } from '@core/api/models/ps2/alert.model';
import { AlertRepository } from '@core/api/ps2/alert.repository';
import { WorldService } from '../../data/world.service';
import { ZoneService } from '../../data/zone.service';
import { PlanetsideAlertsListComponent } from './planetside-alerts-list.component';

const minutes = (n: number) => new Date(Date.now() + n * 60000).toISOString();

const alert = (id: number, name: string, startMinutes: number, endMinutes: number, extra: Partial<Alert> = {}): Alert => ({
    worldId: 17, metagameInstanceId: id, zoneId: 2, startDate: minutes(startMinutes), endDate: minutes(endMinutes),
    lastFactionVs: 41, lastFactionNc: 33, lastFactionTr: 26, metagameEvent: { id: 1, name }, ...extra
});

const WORLDS = [{ id: 17, name: 'Emerald', isActive: true }, { id: 13, name: 'Cobalt', isActive: true }];

function create(getAlerts: (page: number, worldId?: number) => Observable<Alert[]>) {
    TestBed.configureTestingModule({
        providers: [
            provideRouter([]),
            { provide: AlertRepository, useValue: { getAlerts } },
            { provide: WorldService, useValue: { worlds: signal(WORLDS), activeWorlds: signal(WORLDS) } },
            { provide: ZoneService, useValue: { zoneName: (): string => 'Indar' } }
        ]
    });
    const fixture = TestBed.createComponent(PlanetsideAlertsListComponent);
    // A running alert's countdown ticks on a timer, so the zone never settles: render without waiting for it
    fixture.detectChanges();
    return fixture;
}

const names = (el: HTMLElement) => [...el.querySelectorAll('tbody tr:not(.stat-detail)')].map(row => row.querySelector('td')?.textContent?.trim());

describe('PlanetsideAlertsListComponent', () => {
    it('lists the running alerts in a card and the finished ones in a table, the newest first', () => {
        const fixture = create(() => of([
            alert(1, 'Running', -10, 35),
            alert(2, 'Older', -300, -255),
            alert(3, 'Newer', -120, -75)
        ]));
        const el: HTMLElement = fixture.nativeElement;

        expect(el.querySelectorAll('.stat-feed li')).toHaveLength(1);
        expect(el.querySelector('.stat-feed a.stat-link')?.textContent).toContain('Running');
        expect(names(el)).toEqual(['Newer', 'Older']);
        expect(el.querySelector('.stat-feed')?.textContent).toContain('Emerald');
    });

    it('says so when no alert is running', () => {
        const fixture = create(() => of([alert(2, 'Older', -300, -255)]));

        expect(fixture.nativeElement.textContent).toContain('No alerts in progress');
    });

    it('shows the scores in faction colours and marks the leader', () => {
        const fixture = create(() => of([alert(2, 'Older', -300, -255)]));
        const cells = [...fixture.nativeElement.querySelectorAll('tbody tr:first-child td')].slice(4, 7) as HTMLElement[];

        expect(cells.map(c => c.textContent?.trim())).toEqual(['41%', '33%', '26%']);
        expect(cells.map(c => [...c.classList].find(cls => cls.startsWith('faction-')))).toEqual(['faction-vs-text', 'faction-nc-text', 'faction-tr-text']);
        expect(cells[0].classList).toContain('lead');
        expect(cells[1].classList).not.toContain('lead');
    });

    it('reloads for a server chip from the first page, keeping the running alerts', () => {
        const calls: [number, number | undefined][] = [];
        const fixture = create((page, worldId) => {
            calls.push([page, worldId]);
            return of(worldId ? [alert(5, 'Cobalt alert', -200, -155, { worldId })] : [alert(1, 'Running', -10, 35), alert(2, 'Older', -300, -255)]);
        });
        const el: HTMLElement = fixture.nativeElement;

        (el.querySelectorAll('.stat-chip')[2] as HTMLButtonElement).click();
        fixture.detectChanges();

        expect(calls).toEqual([[0, undefined], [0, 13]]);
        expect(names(el)).toEqual(['Cobalt alert']);
        expect(el.querySelectorAll('.stat-feed li')).toHaveLength(1);
    });

    it('pages with the arrows', () => {
        const calls: number[] = [];
        const fixture = create(page => {
            calls.push(page);
            return of([alert(2, 'Older', -300, -255)]);
        });
        const el: HTMLElement = fixture.nativeElement;
        const buttons = () => el.querySelectorAll('.stat-page-button') as NodeListOf<HTMLButtonElement>;

        expect(buttons()[0].disabled).toBe(true);
        buttons()[1].click();
        fixture.detectChanges();

        expect(calls).toEqual([0, 1]);
        expect(el.querySelector('.stat-pager')?.textContent).toContain('Page 2');
        expect(buttons()[0].disabled).toBe(false);
    });

    it('sorts by a column header', () => {
        const fixture = create(() => of([alert(2, 'Bravo', -300, -255), alert(3, 'Alpha', -120, -75)]));
        const el: HTMLElement = fixture.nativeElement;

        (el.querySelector('th[mat-sort-header="name"]') as HTMLElement).click();
        fixture.detectChanges();

        expect(names(el)).toEqual(['Alpha', 'Bravo']);
    });

    it('opens a row on a phone to show the hidden columns', () => {
        const fixture = create(() => of([alert(2, 'Older', -300, -255)]));
        const el: HTMLElement = fixture.nativeElement;

        (el.querySelector('.stat-expand') as HTMLButtonElement).click();
        fixture.detectChanges();

        expect(el.querySelector('.stat-detail')?.textContent).toContain('Emerald');
    });

    it('shows the error card when the alerts fail to load', () => {
        const fixture = create(() => throwError(() => new Error('nope')));

        expect(fixture.nativeElement.querySelector('vw-error-card')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('table')).toBeNull();
    });
});
