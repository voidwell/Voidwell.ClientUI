import { TestBed } from '@angular/core/testing';
import { CharacterDetails } from '@core/api/models/ps2/character.model';
import { PlanetsidePlayerStatsOverviewCardComponent } from './planetside-player-stats-overview-card.component';

describe('PlanetsidePlayerStatsOverviewCardComponent', () => {
    it('shows the score and score per minute, a tile per lifetime stat and the creation date', () => {
        const fixture = TestBed.createComponent(PlanetsidePlayerStatsOverviewCardComponent);
        fixture.componentRef.setInput('player', {
            certsEarned: 1000,
            times: { createdDate: '2015-01-01T12:00:00Z', minutesPlayed: 6000 },
            lifetimeStats: { medalCount: 5, dominationCount: 1, revengeCount: 2, vehicleKills: 3, score: 100000, playTime: 360000 }
        } as CharacterDetails);

        fixture.detectChanges();

        const el: HTMLElement = fixture.nativeElement;
        expect(el.querySelector('.stat-hero-value').textContent).toBe('100,000');
        expect(el.querySelector('.stat-badge').textContent).toBe('16.7');
        const tiles = Array.from(el.querySelectorAll('.stat-metric')).map(t => [
            t.querySelector('.stat-metric-label').textContent.trim(),
            t.querySelector('.stat-metric-value').textContent.trim()
        ]);
        expect(tiles).toEqual([
            ['Certs', '1,000'],
            ['Medals', '5'],
            ['Dominations', '1'],
            ['Revenge', '2'],
            ['Vehicle Kills', '3'],
            ['Hours Played', '100.0']
        ]);
        expect(el.querySelector('.stat-metric-note').textContent.trim()).toBe('(100.0)');
        expect(el.querySelector('.created').textContent).toContain('Created on');
    });
});
