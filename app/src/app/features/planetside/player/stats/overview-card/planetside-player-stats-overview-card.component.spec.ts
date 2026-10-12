import { TestBed } from '@angular/core/testing';
import { PlanetsidePlayerStatsOverviewCardComponent } from './planetside-player-stats-overview-card.component';

describe('PlanetsidePlayerStatsOverviewCardComponent', () => {
    it('renders the card', () => {
        const fixture = TestBed.createComponent(PlanetsidePlayerStatsOverviewCardComponent);
        fixture.componentRef.setInput('player', { certsEarned: 1000, times: { createdDate: '2015-01-01T00:00:00Z', minutesPlayed: 600 }, lifetimeStats: { medalCount: 5, dominationCount: 1, revengeCount: 2, vehicleKills: 3, score: 100000, playTime: 360000 } } as never);

        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('mat-card')).not.toBeNull();
        expect(fixture.nativeElement.textContent).toContain('1,000');
    });
});
