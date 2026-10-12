import { TestBed } from '@angular/core/testing';
import { CharacterDetailsLifetimeStats } from '@core/api/models/ps2/character.model';
import { PlanetsidePlayerStatsKdrCardComponent } from './planetside-player-stats-kdr-card.component';

describe('PlanetsidePlayerStatsKdrCardComponent', () => {
    const render = (kills: number, deaths: number) => {
        const fixture = TestBed.createComponent(PlanetsidePlayerStatsKdrCardComponent);
        fixture.componentRef.setInput('stats', { kills, deaths, headshots: 25, assistCount: 7 } as CharacterDetailsLifetimeStats);
        fixture.detectChanges();
        return fixture.nativeElement as HTMLElement;
    };

    it('shows the K/D ratio, the spread, the split bar and the supporting counts', () => {
        const el = render(100, 50);

        expect(el.querySelector('.hero-value').textContent).toBe('2.00');
        expect(el.querySelector('.spread-value').textContent.trim()).toBe('+50');
        expect(el.querySelector('.spread-value').classList).toContain('positive');
        expect((el.querySelector('.bar-fill.kills') as HTMLElement).style.width).toContain('66.6');
        const tiles = Array.from(el.querySelectorAll('.tile')).map(t => t.querySelector('.tile-value').textContent.trim());
        expect(tiles).toEqual(['100', '50', '25', '7']);
        expect(el.textContent).toContain('25.00% of kills');
    });

    it('marks a negative spread', () => {
        const el = render(40, 80);

        expect(el.querySelector('.spread-value').textContent.trim()).toBe('-40');
        expect(el.querySelector('.spread-value').classList).toContain('negative');
    });
});
