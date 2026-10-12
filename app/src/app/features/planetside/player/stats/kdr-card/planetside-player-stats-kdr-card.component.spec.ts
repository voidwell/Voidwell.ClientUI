import { TestBed } from '@angular/core/testing';
import { PlanetsidePlayerStatsKdrCardComponent } from './planetside-player-stats-kdr-card.component';

describe('PlanetsidePlayerStatsKdrCardComponent', () => {
    it('renders the card', () => {
        const fixture = TestBed.createComponent(PlanetsidePlayerStatsKdrCardComponent);
        fixture.componentRef.setInput('stats', { kills: 100, deaths: 50, headshots: 25, assistCount: 7 } as never);

        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('mat-card')).not.toBeNull();
        expect(fixture.nativeElement.textContent).toContain('2.00');
    });
});
