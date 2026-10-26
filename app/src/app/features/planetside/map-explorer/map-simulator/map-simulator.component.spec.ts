import { Component, input, output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ZoneRepository } from '@core/api/ps2/zone.repository';
import { ZoneRegion } from '../../components/ps2-zone-map/models';
import { Ps2ZoneMapComponent } from '../../components/ps2-zone-map/ps2-zone-map.component';
import { ZoneService } from '../../data/zone.service';
import { PlanetsideMapSimulatorComponent } from './map-simulator.component';

/** Stands in for the Leaflet map, which has nothing to draw in a test. */
@Component({ selector: 'ps2-zone-map', template: '' })
class FakeZoneMapComponent {
    readonly zoneId = input<number>();
    readonly hideOverlay = input<boolean>();
    readonly captureStream = input<unknown>();
    readonly score = output<number[]>();
    readonly hexSelected = output<ZoneRegion>();
}

function create() {
    TestBed.configureTestingModule({
        providers: [ZoneService, { provide: ZoneRepository, useValue: { getZones: () => of([{ id: 2, name: 'Indar' }]) } }]
    });
    TestBed.overrideComponent(PlanetsideMapSimulatorComponent, { remove: { imports: [Ps2ZoneMapComponent] }, add: { imports: [FakeZoneMapComponent] } });
    const fixture = TestBed.createComponent(PlanetsideMapSimulatorComponent);
    fixture.componentRef.setInput('zoneId', '2');
    fixture.detectChanges();
    return fixture;
}

const region = (faction: number, facilityId = '1234'): ZoneRegion => ({ faction, facility: { id: facilityId } }) as unknown as ZoneRegion;

describe('PlanetsideMapSimulatorComponent', () => {
    it('is titled with the continent and starts with the territory colours off', () => {
        const el: HTMLElement = create().nativeElement;

        expect(el.querySelector('mat-card-title')?.textContent?.trim()).toBe('Indar');
        expect(el.querySelector('.toggle')?.getAttribute('aria-pressed')).toBe('false');
    });

    it('turns the territory colours on and off with its button', () => {
        const fixture = create();
        const toggle = fixture.nativeElement.querySelector('.toggle') as HTMLButtonElement;

        toggle.click();
        fixture.detectChanges();
        expect(toggle.getAttribute('aria-pressed')).toBe('true');
        expect(toggle.classList.contains('on')).toBe(true);

        toggle.click();
        fixture.detectChanges();
        expect(toggle.getAttribute('aria-pressed')).toBe('false');
    });

    it('gives a clicked facility to the next faction, and none after the last', () => {
        const component = create().componentInstance;
        const captures: unknown[] = [];
        component.onFacilityCapture.subscribe(event => captures.push(event));

        component.onHexSelected(region(0));
        component.onHexSelected(region(3));

        expect(captures).toEqual([{ facilityId: '1234', factionId: 1, zoneId: 2, noFlash: true }, { facilityId: '1234', factionId: 0, zoneId: 2, noFlash: true }]);
    });

    it('logs a command for each changed facility when q is pressed', () => {
        const fixture = create();
        const component = fixture.componentInstance;
        const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

        component.onHexSelected(region(0, '10'));
        component.onHexSelected(region(1, '20'));
        component.onKeypress(new KeyboardEvent('keypress', { key: 'q' }));

        expect(log).toHaveBeenCalledWith('/facility setfaction 1 10;/facility setfaction 2 20');
        log.mockRestore();
    });

    it('shows the territory held in its bar', () => {
        const fixture = create();

        fixture.componentInstance.onScoreChange([10, 50, 25, 15]);
        fixture.detectChanges();

        expect(fixture.componentInstance.score()).toEqual([10, 50, 25, 15]);
        expect(fixture.nativeElement.querySelector('vw-faction-bar')).not.toBeNull();
    });
});
