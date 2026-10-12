import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PerformanceGrades } from '../../../data/performance-grades.service';
import { PlanetsidePlayerStatsIviCardComponent } from './planetside-player-stats-ivi-card.component';

describe('PlanetsidePlayerStatsIviCardComponent', () => {
    it('renders the card', () => {
        TestBed.configureTestingModule({ providers: [{ provide: PerformanceGrades, useValue: { grades: signal(null) } }] });
        const fixture = TestBed.createComponent(PlanetsidePlayerStatsIviCardComponent);
        fixture.componentRef.setInput('stats', { iviScore: 500, kdrPadding: 1.2, kills: 90, weapons: 10, unsanctionedWeapons: 2, accuracy: 0.2, headshotRatio: 0.3, killDeathRatio: 1.2, killsPerMinute: 0.8 } as never);

        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('mat-card')).not.toBeNull();
        expect(fixture.nativeElement.textContent).toContain('500');
    });
});
