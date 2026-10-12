import { TestBed } from '@angular/core/testing';
import { CharacterDetails } from '@core/api/models/ps2/character.model';
import { PlanetsidePlayerQuickStatsCardComponent } from './planetside-player-quick-stats-card.component';

describe('PlanetsidePlayerQuickStatsCardComponent', () => {
    it('shows the quick stats once the player is loaded', () => {
        const fixture = TestBed.createComponent(PlanetsidePlayerQuickStatsCardComponent);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('mat-card')).toBeNull();

        fixture.componentRef.setInput('player', {
            lifetimeStats: { kills: 100, deaths: 50 },
            times: { minutesPlayed: 600 }
        } as CharacterDetails);
        fixture.detectChanges();

        const text = fixture.nativeElement.textContent;
        expect(text).toContain('Quick Stats');
        expect(text).toContain('2.00');
        expect(text).toContain('10h');
    });
});
