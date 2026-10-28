import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { WorldActivity } from '@core/api/models/ps2/world.model';
import { WorldRepository } from '@core/api/ps2/world.repository';
import { WorldsPopulationCardComponent } from './worlds-population-card.component';

const activity = (total: number): WorldActivity => ({
    activityPeriodStart: '', activityPeriodEnd: '',
    historicalPopulations: [{ timestamp: '2026-10-28T10:00:00Z', vs: total, nc: 0, tr: 0, ns: 0 }]
});

function create(getWorldActivity: (worldId: number) => ReturnType<WorldRepository['getWorldActivity']>) {
    TestBed.configureTestingModule({ providers: [{ provide: WorldRepository, useValue: { getWorldActivity } }] });
    const fixture = TestBed.createComponent(WorldsPopulationCardComponent);
    fixture.componentRef.setInput('worlds', [{ id: 17, name: 'Emerald' }, { id: 13, name: 'Cobalt' }]);
    fixture.detectChanges();
    return fixture;
}

describe('WorldsPopulationCardComponent', () => {
    it('offers a chip for each server, all of them on to begin with', () => {
        const fixture = create(id => of(activity(id)));
        const chips = [...fixture.nativeElement.querySelectorAll('button.stat-chip')] as HTMLButtonElement[];

        expect(chips.map(chip => chip.textContent?.trim())).toEqual(['Cobalt', 'Emerald']);
        expect(chips.map(chip => chip.getAttribute('aria-pressed'))).toEqual(['true', 'true']);
        expect(fixture.componentInstance.shown().map(series => series.name)).toEqual(['Cobalt', 'Emerald']);
    });

    it('switches a server off and on again with its chip', () => {
        const fixture = create(id => of(activity(id)));
        const chips = () => [...fixture.nativeElement.querySelectorAll('button.stat-chip')] as HTMLButtonElement[];

        chips()[0].click();
        fixture.detectChanges();
        expect(fixture.componentInstance.shown().map(series => series.name)).toEqual(['Emerald']);
        expect(chips()[0].getAttribute('aria-pressed')).toBe('false');

        chips()[0].click();
        fixture.detectChanges();
        expect(fixture.componentInstance.shown().map(series => series.name)).toEqual(['Cobalt', 'Emerald']);
    });

    it('asks for a server when every one is switched off', () => {
        const fixture = create(id => of(activity(id)));

        for (const chip of fixture.nativeElement.querySelectorAll('button.stat-chip') as NodeListOf<HTMLButtonElement>) {
            chip.click();
        }
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Pick a server to plot');
    });

    it('keeps the other servers when one history fails to load', () => {
        const fixture = create(id => id === 17 ? throwError(() => new Error('down')) : of(activity(5)));

        expect(fixture.componentInstance.shown().map(series => series.name)).toEqual(['Cobalt']);
    });

    it('says so when there is no population', () => {
        const fixture = create(() => of({ activityPeriodStart: '', activityPeriodEnd: '' }));

        expect(fixture.nativeElement.textContent).toContain('No population to show');
    });
});
