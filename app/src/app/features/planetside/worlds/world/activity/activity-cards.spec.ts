import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CombatReportClassStats } from '@core/api/models/ps2/combat-report.model';
import { AlertView } from '../../../components/alert-view';
import { ZoneService } from '../../../data/zone.service';
import { ActiveAlertsCardComponent } from '../../../components/active-alerts-card/active-alerts-card.component';
import { ActivityClassesCardComponent } from './activity-classes-card/activity-classes-card.component';
import { ActivityPlayersCardComponent } from './activity-players-card/activity-players-card.component';
import { TopPlayerRow } from '../../../components/combat-report/combat-report-figures';

const classStats = (name: string, factionId: number, kills: number): CombatReportClassStats =>
    ({ profile: { name, factionId }, kills, deaths: 10, headshots: 1, suicides: 0, teamkills: 0, vehicleKills: 0 });

const player = (id: string, name: string, kills: number, topWeaponName?: string): TopPlayerRow => ({
    id, name, factionId: 2, prestigeLevel: 0, kills, deaths: 10, kdr: null, hsr: null, kpm: null, sessionKills: 0, sessionKpm: null,
    teamkills: 0, suicides: 0, vehicleKills: 0, sessionMinutes: null, playTime: null, topWeaponName
});

const names = (el: HTMLElement) => [...el.querySelectorAll('tbody tr')].map(row => row.querySelector('td')?.textContent?.replace(/\s+/g, ' ').trim());

describe('ActivityClassesCardComponent', () => {
    it('shows one faction\'s classes at a time, the most kills first', async () => {
        TestBed.configureTestingModule({ providers: [provideRouter([])] });
        const fixture = TestBed.createComponent(ActivityClassesCardComponent);
        fixture.componentRef.setInput('classes', [classStats('Medic', 1, 5), classStats('Heavy', 1, 9), classStats('Heavy', 2, 7)]);
        fixture.autoDetectChanges();
        await fixture.whenStable();
        const el: HTMLElement = fixture.nativeElement;

        expect(names(el)).toEqual(['Heavy', 'Medic']);

        (el.querySelectorAll('.stat-chip')[1] as HTMLButtonElement).click();
        await fixture.whenStable();
        expect(names(el)).toEqual(['Heavy']);
    });
});

describe('ActivityPlayersCardComponent', () => {
    it('sorts by a column header, and keeps players without the figure last', async () => {
        TestBed.configureTestingModule({ providers: [provideRouter([])] });
        const fixture = TestBed.createComponent(ActivityPlayersCardComponent);
        fixture.componentRef.setInput('players', [player('1', 'Bravo', 5, 'Zeta'), player('2', 'Alpha', 9), player('3', 'Charlie', 1, 'Gauss')]);
        fixture.autoDetectChanges();
        await fixture.whenStable();
        const el: HTMLElement = fixture.nativeElement;

        expect(names(el)).toEqual(['Alpha', 'Bravo', 'Charlie']);

        (el.querySelector('th[mat-sort-header="topWeaponName"]') as HTMLElement).click();
        await fixture.whenStable();
        expect(names(el)).toEqual(['Charlie', 'Bravo', 'Alpha']);
    });

    it('says so when there are no players', async () => {
        TestBed.configureTestingModule({ providers: [provideRouter([])] });
        const fixture = TestBed.createComponent(ActivityPlayersCardComponent);
        fixture.autoDetectChanges();
        await fixture.whenStable();

        expect(fixture.nativeElement.querySelector('table')).toBeNull();
        expect(fixture.nativeElement.textContent).toContain('No players to show');
    });
});

describe('ActiveAlertsCardComponent', () => {
    const alert = (id: number, name: string, startMinutesAgo: number): AlertView => ({
        worldId: 17, metagameInstanceId: id, zoneId: 2, startDate: new Date(Date.now() - startMinutesAgo * 60000),
        endDate: new Date(Date.now() + 30 * 60000), lastFactionVs: 35.4, lastFactionNc: 34, lastFactionTr: 30.6, metagameEvent: { id: 1, name }
    });

    function create(alerts: AlertView[]) {
        TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ZoneService, useValue: { zoneName: (): string => 'Indar' } }] });
        const fixture = TestBed.createComponent(ActiveAlertsCardComponent);
        fixture.componentRef.setInput('alerts', alerts);
        // The countdown ticks on a timer, so the zone never settles: render once instead of waiting for it
        fixture.detectChanges();
        return fixture;
    }

    it('lists the oldest alert first with the scores in faction colours and no faction names', () => {
        const fixture = create([alert(2, 'Newer', 1), alert(1, 'Older', 10)]);
        const el: HTMLElement = fixture.nativeElement;

        expect([...el.querySelectorAll('li a.stat-link')].map(a => a.textContent?.trim())).toEqual(['Older', 'Newer']);
        const scores = [...el.querySelector('li')!.querySelectorAll('.scores span')];
        expect(scores.map(s => s.textContent?.trim())).toEqual(['35%', '34%', '31%']);
        expect(scores.map(s => [...s.classList].find(c => c.startsWith('faction-')))).toEqual(['faction-vs-text', 'faction-nc-text', 'faction-tr-text']);
        expect(el.querySelector('li a.stat-link')?.className).not.toMatch(/faction-/);
        expect(el.querySelector('vw-alert-indicator')).not.toBeNull();
        expect(el.querySelector('.stat-pill.amber')?.textContent).toContain('remaining');
    });

    it('shows nothing without alerts', async () => {
        const fixture = create([]);
        await fixture.whenStable();

        expect(fixture.nativeElement.querySelector('mat-card')).toBeNull();
    });
});
