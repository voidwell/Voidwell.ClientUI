import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PlanetsidePlayerStatsOutfitCardComponent } from './planetside-player-stats-outfit-card.component';

describe('PlanetsidePlayerStatsOutfitCardComponent', () => {
    it('renders the card', () => {
        TestBed.configureTestingModule({ providers: [provideRouter([])] });
        const fixture = TestBed.createComponent(PlanetsidePlayerStatsOutfitCardComponent);
        fixture.componentRef.setInput('player', { factionId: 1, outfit: { id: '9', alias: 'TEST', name: 'Test Outfit', rank: 'Leader', memberCount: 10, memberSinceDate: '2020-01-01T00:00:00Z', createdDate: '2019-01-01T00:00:00Z' } } as never);

        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('mat-card')).not.toBeNull();
        expect(fixture.nativeElement.textContent).toContain('Test Outfit');
    });
});
