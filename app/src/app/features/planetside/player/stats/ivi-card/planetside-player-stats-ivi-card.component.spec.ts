import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { InfantryStats } from '@core/api/models/ps2/character.model';
import { PerformanceGrades } from '../../../data/performance-grades.service';
import { PlanetsidePlayerStatsIviCardComponent } from './planetside-player-stats-ivi-card.component';

describe('PlanetsidePlayerStatsIviCardComponent', () => {
    it('shows the IVI score, the supporting numbers and a graded tile per metric', () => {
        TestBed.configureTestingModule({
            providers: [{
                provide: PerformanceGrades,
                useValue: { grades: signal([{ grade: 'S', delta: 1 }, { grade: 'A', delta: 0 }, { grade: 'B', delta: -100 }]) }
            }]
        });
        const fixture = TestBed.createComponent(PlanetsidePlayerStatsIviCardComponent);
        fixture.componentRef.setInput('stats', {
            iviScore: 500, kdrPadding: 1.2, kills: 900, weapons: 10, unsanctionedWeapons: 2,
            accuracy: 0.2, accuracyDelta: 0.5, headshotRatio: 0.3, headshotRatioDelta: 2,
            killDeathRatio: 1.2, killDeathRatioDelta: -5, killsPerMinute: 0.8, killsPerMinuteDelta: 0.1
        } as InfantryStats);

        fixture.detectChanges();

        const el: HTMLElement = fixture.nativeElement;
        expect(el.querySelector('.score-value').textContent).toBe('500');
        expect(el.querySelector('.meta').textContent).toContain('1.200');
        expect(el.querySelector('.meta').textContent).toContain('900');
        expect(el.querySelector('.meta').textContent).toContain('10 / 2');

        const tiles = Array.from(el.querySelectorAll('.tile')).map(tile => [
            tile.querySelector('.tile-label').textContent.trim(),
            tile.querySelector('.tile-value').textContent.trim(),
            tile.querySelector('.grade').textContent.trim()
        ]);
        expect(tiles).toEqual([
            ['Accuracy', '20.000%', 'A'],
            ['HSR', '30.000%', 'S'],
            ['KDR', '1.200', 'B'],
            ['KpM', '0.800', 'A']
        ]);
    });
});
