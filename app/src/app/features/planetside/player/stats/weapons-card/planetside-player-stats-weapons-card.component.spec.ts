import { TestBed } from '@angular/core/testing';
import { PlanetsidePlayerStatsWeaponsCardComponent } from './planetside-player-stats-weapons-card.component';

describe('PlanetsidePlayerStatsWeaponsCardComponent', () => {
    it('renders the card', () => {
        const fixture = TestBed.createComponent(PlanetsidePlayerStatsWeaponsCardComponent);
        fixture.componentRef.setInput('stats', { fireCount: 1000, hitCount: 250, kills: 50, damageGiven: 500, damageTakenBy: 300 } as never);

        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('mat-card')).not.toBeNull();
        expect(fixture.nativeElement.textContent).toContain('25.00%');
    });
});
