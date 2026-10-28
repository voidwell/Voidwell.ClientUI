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
    it('offers a chip for each server, and narrows the chart to the one chosen', () => {
        const fixture = create(id => of(activity(id)));
        const chips = () => [...fixture.nativeElement.querySelectorAll('button.stat-chip')] as HTMLButtonElement[];

        expect(chips().map(chip => chip.textContent?.trim())).toEqual(['All servers', 'Cobalt', 'Emerald']);
        expect(fixture.componentInstance.shown().map(series => series.name)).toEqual(['Cobalt', 'Emerald']);

        chips()[2].click();
        fixture.detectChanges();

        expect(fixture.componentInstance.shown().map(series => series.name)).toEqual(['Emerald']);
        expect(fixture.nativeElement.textContent).toContain('Emerald');
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
