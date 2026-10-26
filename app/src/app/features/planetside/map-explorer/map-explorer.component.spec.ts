import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { ZoneRepository } from '@core/api/ps2/zone.repository';
import { ZoneService } from '../data/zone.service';
import { PlanetsideMapExplorerComponent } from './map-explorer.component';
import { PlanetsideMapSimulatorComponent } from './map-simulator/map-simulator.component';

const ZONES = [{ id: 2, name: 'Indar' }, { id: 4, name: 'Hossin' }, { id: 10, name: 'Test Zone' }, { id: 344, name: 'Oshur' }];

/** Stands in for the Leaflet map, which has nothing to draw in a test. */
@Component({ selector: 'ps2-zone-map', template: '' })
class FakeZoneMapComponent {
    readonly zoneId = input<number>();
    readonly hideOverlay = input<boolean>();
}

async function create(url: string) {
    TestBed.configureTestingModule({
        providers: [
            provideRouter([{
                path: 'map',
                component: PlanetsideMapExplorerComponent,
                children: [{ path: ':zoneId', component: PlanetsideMapSimulatorComponent }]
            }], withComponentInputBinding()),
            ZoneService,
            { provide: ZoneRepository, useValue: { getZones: () => of(ZONES) } }
        ]
    });
    TestBed.overrideComponent(PlanetsideMapSimulatorComponent, {
        set: { imports: [FakeZoneMapComponent], template: '<ps2-zone-map [zoneId]="zoneId()" [hideOverlay]="hideOverlay()"></ps2-zone-map>' }
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    harness.detectChanges();
    return harness;
}

describe('PlanetsideMapExplorerComponent', () => {
    it('lists the continents players can visit as links, and marks the one shown', async () => {
        const harness = await create('/map/4');
        const el: HTMLElement = harness.routeNativeElement as HTMLElement;
        const chips = [...el.querySelectorAll('.zones a.stat-chip')] as HTMLAnchorElement[];

        expect(chips.map(chip => chip.textContent?.trim())).toEqual(['Indar', 'Hossin', 'Oshur']);
        expect(chips.map(chip => chip.classList.contains('on'))).toEqual([false, true, false]);
        expect(chips[1].getAttribute('aria-current')).toBe('page');
    });

    it('shows another continent when its link is followed', async () => {
        const harness = await create('/map/2');
        const router = TestBed.inject(Router);

        await router.navigateByUrl('/map/344');
        harness.detectChanges();

        const chips = [...(harness.routeNativeElement as HTMLElement).querySelectorAll('.zones a.stat-chip')];
        expect(chips.map(chip => chip.classList.contains('on'))).toEqual([false, false, true]);
    });
});
