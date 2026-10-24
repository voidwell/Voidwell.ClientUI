import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { CaptureLogRow, CombatReportParticipantStats } from '@core/api/models/ps2/combat-report.model';
import { CustomEventDetails } from '@core/api/models/platform/custom-event.model';
import { PlanetsideCombatEventComponent } from '../../components/combat-event/planetside-combat-event.component';
import { PlanetsideAlertMapComponent } from './map/planetside-alert-map.component';
import { PlanetsideAlertOutfitsComponent } from './outfits/planetside-alert-outfits.component';
import { PlanetsideAlertPlayersComponent } from './players/planetside-alert-players.component';

const player = (id: string, name: string, kills: number, extra: Partial<CombatReportParticipantStats> = {}): CombatReportParticipantStats => ({
    character: { id, name, factionId: 2 }, kills, deaths: 10, headshots: 2, suicides: 0, teamkills: 0, vehicleKills: 0, sessionKills: 0, ...extra
});

const withEvent = (log: CustomEventDetails['log']) => ({
    provide: PlanetsideCombatEventComponent,
    useValue: { event: signal({ log } as CustomEventDetails) }
});

const names = (el: HTMLElement) => [...el.querySelectorAll('tbody tr')].map(row => row.querySelector('td.left:not(.stat-muted)')?.textContent?.replace(/\s+/g, ' ').trim());

describe('PlanetsideAlertPlayersComponent', () => {
    function create(participants: CombatReportParticipantStats[]) {
        TestBed.configureTestingModule({ providers: [provideRouter([]), withEvent({ stats: { participants } })] });
        const fixture = TestBed.createComponent(PlanetsideAlertPlayersComponent);
        fixture.autoDetectChanges();
        return fixture;
    }

    it('lists the players by kills, colours their names, and offers no filter or pager for a short list', async () => {
        const fixture = create([player('1', 'Bravo', 5), player('2', 'Alpha', 9, { outfit: { name: 'Voidwell Veterans', alias: 'VKTZ' } })]);
        await fixture.whenStable();
        const el: HTMLElement = fixture.nativeElement;

        expect(names(el)).toEqual(['[VKTZ] Alpha', 'Bravo']);
        expect(el.querySelector('a.faction-nc-text')).not.toBeNull();
        expect(el.querySelector('input[type=search]')).toBeNull();
        expect(el.querySelector('.stat-pager')).toBeNull();
    });

    it('filters and pages a long list', async () => {
        const many = Array.from({ length: 30 }, (_, i) => player(String(i), `P${String(i).padStart(2, '0')}`, 100 - i));
        const fixture = create(many);
        await fixture.whenStable();
        const el: HTMLElement = fixture.nativeElement;

        expect(el.querySelectorAll('tbody tr')).toHaveLength(25);
        expect(el.querySelector('.stat-pager')?.textContent).toContain('1–25 of 30');

        (el.querySelectorAll('.stat-page-button')[1] as HTMLButtonElement).click();
        await fixture.whenStable();
        expect(el.querySelectorAll('tbody tr')).toHaveLength(5);

        const input = el.querySelector('input[type=search]') as HTMLInputElement;
        input.value = 'P07';
        input.dispatchEvent(new Event('input'));
        await fixture.whenStable();
        expect(names(el)).toEqual(['P07']);
    });

    it('says so when no one was recorded', async () => {
        const fixture = create([]);
        await fixture.whenStable();

        expect(fixture.nativeElement.textContent).toContain('No players recorded');
    });
});

describe('PlanetsideAlertOutfitsComponent', () => {
    it('lists the outfits by kills with their faction colour', async () => {
        TestBed.configureTestingModule({
            providers: [provideRouter([]), withEvent({
                stats: {
                    outfits: [
                        { outfit: { id: '1', name: 'Small', factionId: 1 }, kills: 5, deaths: 5, headshots: 1, suicides: 0, teamkills: 0, vehicleKills: 0, participantCount: 2, facilityCaptures: 0 },
                        { outfit: { id: '2', name: 'Big', alias: 'BIG', factionId: 3 }, kills: 50, deaths: 25, headshots: 10, suicides: 0, teamkills: 0, vehicleKills: 0, participantCount: 20, facilityCaptures: 4 }
                    ]
                }
            })]
        });
        const fixture = TestBed.createComponent(PlanetsideAlertOutfitsComponent);
        fixture.autoDetectChanges();
        await fixture.whenStable();
        const el: HTMLElement = fixture.nativeElement;

        expect(names(el)).toEqual(['[BIG] Big', 'Small']);
        expect(el.querySelector('a.faction-tr-text')).not.toBeNull();
    });
});

describe('PlanetsideAlertMapComponent', () => {
    const log: CaptureLogRow[] = [
        { timestamp: '2026-10-20T10:00:00Z', newFactionId: 1, oldFactionId: 2, mapRegion: { id: 5, facilityName: 'Tawrich' }, factionVs: 40, factionNc: 30, factionTr: 30 },
        { timestamp: '2026-10-20T10:05:00Z', newFactionId: 3, oldFactionId: 3, mapRegion: { id: 6, facilityName: 'Hvar' }, factionVs: 40, factionNc: 30, factionTr: 30 }
    ];

    function create() {
        TestBed.configureTestingModule({ providers: [provideRouter([]), withEvent({ captureLog: log })] });
        const fixture = TestBed.createComponent(PlanetsideAlertMapComponent);
        fixture.autoDetectChanges();
        return fixture;
    }

    it('lists captures first, with the faction each was taken from shown as its emblem', async () => {
        const fixture = create();
        await fixture.whenStable();
        const el: HTMLElement = fixture.nativeElement;

        expect(names(el)).toEqual(['Tawrich']);
        expect(el.querySelector('tbody vw-faction-icon img')?.getAttribute('title')).toBe('New Conglomerate');
    });

    it('adds the defends with a toggle, which have no faction they were taken from', async () => {
        const fixture = create();
        await fixture.whenStable();
        const el: HTMLElement = fixture.nativeElement;

        (el.querySelectorAll('.stat-chip')[1] as HTMLButtonElement).click();
        await fixture.whenStable();

        expect(names(el)).toEqual(['Tawrich', 'Hvar']);
        expect(el.querySelectorAll('tbody tr')[1].querySelector('vw-faction-icon')).toBeNull();
        expect(el.querySelector('replay-map')).toBeNull();
    });

    it('takes the captures off with their toggle', async () => {
        const fixture = create();
        await fixture.whenStable();
        const el: HTMLElement = fixture.nativeElement;

        (el.querySelectorAll('.stat-chip')[0] as HTMLButtonElement).click();
        await fixture.whenStable();

        expect(el.querySelector('table')).toBeNull();
        expect(el.textContent).toContain('No map events to show');
    });
});
