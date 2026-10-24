import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { WorldActivity, WorldActivityStats } from '@core/api/models/ps2/world.model';
import { AlertView } from '../../../components/alert-view';
import { PlanetsideWorldComponent } from '../planetside-world.component';
import { PlanetsideWorldActivityComponent } from './planetside-world-activity.component';

const zero = { vs: 0, nc: 0, tr: 0, ns: 0 };
const STATS = Object.fromEntries(['kills', 'deaths', 'headshots', 'teamKills', 'suicides', 'vehicleKills', 'kdr', 'hsr'].map(key => [key, zero])) as unknown as WorldActivityStats;

const ACTIVITY: WorldActivity = {
    activityPeriodStart: '2026-10-20T10:00:00Z',
    activityPeriodEnd: '2026-10-20T11:00:00Z',
    historicalPopulations: [],
    stats: STATS,
    classStats: [],
    topVehicles: [],
    topPlayers: [],
    topOutfits: [],
    topWeapons: []
};

describe('PlanetsideWorldActivityComponent', () => {
    it('replaces the loader with the activity once the world page has loaded it', async () => {
        const activity = signal<WorldActivity | null>(null);
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                { provide: PlanetsideWorldComponent, useValue: { activity, alerts: signal<AlertView[] | null>(null) } }
            ]
        });
        const fixture = TestBed.createComponent(PlanetsideWorldActivityComponent);
        fixture.autoDetectChanges();
        await fixture.whenStable();
        expect(fixture.nativeElement.querySelector('.world-activity')).toBeNull();

        activity.set(ACTIVITY);
        await fixture.whenStable();

        expect(fixture.nativeElement.querySelector('.world-activity')).not.toBeNull();
        expect(fixture.componentInstance.activity()?.activityPeriodEnd).toEqual(new Date('2026-10-20T11:00:00Z'));
    });
});
