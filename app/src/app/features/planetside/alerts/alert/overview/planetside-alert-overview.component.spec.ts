import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { CaptureLogRow, CombatReportParticipantStats } from '@core/api/models/ps2/combat-report.model';
import { CustomEventDetails } from '@core/api/models/platform/custom-event.model';
import { PlanetsideCombatEventComponent } from '../../../components/combat-event/planetside-combat-event.component';
import { PlanetsideAlertOverviewComponent } from './planetside-alert-overview.component';
import { topRanked } from './faction-filter';

const player = (id: string, name: string, kills: number, factionId: number): CombatReportParticipantStats => ({
    character: { id, name, factionId }, kills, deaths: 10, headshots: 2, suicides: 0, teamkills: 0, vehicleKills: 0, sessionKills: 0
});

const log: CaptureLogRow[] = [
    { timestamp: '2026-10-20T10:00:00Z', newFactionId: 1, oldFactionId: 2, mapRegion: { id: 5, facilityName: 'Tawrich' }, factionVs: 40, factionNc: 30, factionTr: 30 },
    { timestamp: '2026-10-20T10:05:00Z', newFactionId: 3, oldFactionId: 3, mapRegion: { id: 6, facilityName: 'Hvar' }, factionVs: 40, factionNc: 30, factionTr: 30 }
];

describe('PlanetsideAlertOverviewComponent', () => {
    const section = signal<string | null>('Players');

    async function create(participants: CombatReportParticipantStats[]) {
        TestBed.configureTestingModule({
            providers: [provideRouter([]), {
                provide: PlanetsideCombatEventComponent,
                useValue: { section, event: signal({ log: { stats: { participants }, captureLog: log } } as CustomEventDetails) }
            }]
        });
        const fixture = TestBed.createComponent(PlanetsideAlertOverviewComponent);
        fixture.autoDetectChanges();
        await fixture.whenStable();
        return fixture;
    }

    const names = (el: HTMLElement) => [...el.querySelectorAll('alert-top-players-card tbody tr')].map(row => row.querySelector('td.left')?.textContent?.trim());

    it('clears the breadcrumb section and links each card on to its page', async () => {
        const fixture = await create([player('1', 'Alpha', 9, 1)]);
        const links = [...fixture.nativeElement.querySelectorAll('a.stat-action')].map(a => (a as HTMLAnchorElement).getAttribute('href'));

        expect(section()).toBeNull();
        expect(links).toEqual(expect.arrayContaining(['/players', '/outfits', '/weapons', '/vehicles', '/map']));
    });

    it('shows the top ten players, narrowed to one empire by the filter', async () => {
        const many = Array.from({ length: 12 }, (_, i) => player(String(i), `P${String(i).padStart(2, '0')}`, 100 - i, i % 2 ? 2 : 1));
        const fixture = await create(many);
        const el: HTMLElement = fixture.nativeElement;

        expect(names(el)).toHaveLength(10);

        const chips = [...el.querySelectorAll('alert-top-players-card .vw-chip')] as HTMLButtonElement[];
        expect(chips.map(chip => chip.textContent?.trim())).toEqual(['All', 'VS', 'NC', 'TR']);
        chips[2].click();
        await fixture.whenStable();

        expect(names(el)).toEqual(['P01', 'P03', 'P05', 'P07', 'P09', 'P11']);
    });

    it('logs captures and defends beside the map, with a flag or shield before the facility and the factions after it', async () => {
        const fixture = await create([]);
        const rows = [...(fixture.nativeElement as HTMLElement).querySelectorAll('alert-replay-card li')];

        expect(rows).toHaveLength(2);
        expect(rows[0].querySelector('.badge.capture')).not.toBeNull();
        expect(rows[0].querySelectorAll('.held vw-faction-icon')).toHaveLength(2);
        expect(rows[0].querySelector('.arrow')).not.toBeNull();
        expect(rows[1].querySelector('.badge.defend')).not.toBeNull();
        expect(rows[1].querySelectorAll('.held vw-faction-icon')).toHaveLength(1);
        expect(rows[1].querySelector('.arrow')).toBeNull();
        expect(rows[1].querySelector('.held .mat-icon')).toBeNull();
    });
});

describe('topRanked', () => {
    const rows = [{ factionId: 1, kills: 3, captures: 5 }, { factionId: 2, kills: 9, captures: 1 }, { factionId: 1, kills: 7, captures: 5 }];

    it('keeps the empire asked for and the best of it', () => {
        expect(topRanked(rows, 1, row => row.kills, 1)).toEqual([rows[2]]);
        expect(topRanked(rows, null, row => row.kills, 2).map(row => row.kills)).toEqual([9, 7]);
    });

    it('breaks a tie in the ranking by kills', () => {
        expect(topRanked(rows, null, row => row.captures).map(row => row.kills)).toEqual([7, 3, 9]);
    });
});
