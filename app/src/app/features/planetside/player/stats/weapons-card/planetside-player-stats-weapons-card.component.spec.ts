import { TestBed } from '@angular/core/testing';
import { CharacterDetailsLifetimeStats } from '@core/api/models/ps2/character.model';
import { PlanetsidePlayerStatsWeaponsCardComponent } from './planetside-player-stats-weapons-card.component';

describe('PlanetsidePlayerStatsWeaponsCardComponent', () => {
    const render = (damageGiven: number, damageTakenBy: number) => {
        const fixture = TestBed.createComponent(PlanetsidePlayerStatsWeaponsCardComponent);
        fixture.componentRef.setInput('stats', { fireCount: 1000, hitCount: 250, kills: 50, damageGiven, damageTakenBy } as CharacterDetailsLifetimeStats);
        fixture.detectChanges();
        return fixture.nativeElement as HTMLElement;
    };

    it('shows the accuracy, the damage spread, the accuracy bar and the supporting counts', () => {
        const el = render(500, 300);

        expect(el.querySelector('.stat-hero-value').textContent).toBe('25.00%');
        expect(el.querySelector('.stat-badge').textContent.trim()).toBe('+200');
        expect(el.querySelector('.stat-badge').classList).toContain('positive');
        expect((el.querySelector('.stat-meter > .accuracy') as HTMLElement).style.width).toBe('25%');
        expect(el.querySelector('.stat-meter-legend').textContent).toContain('20.00 shots per kill');
        expect(el.querySelector('.stat-meter-legend').textContent).toContain('5.00 landed per kill');
        const tiles = Array.from(el.querySelectorAll('.stat-metric')).map(t => t.querySelector('.stat-metric-value').textContent.trim());
        expect(tiles).toEqual(['1,000', '250', '500', '300']);
    });

    it('marks a negative damage spread', () => {
        const el = render(100, 400);

        expect(el.querySelector('.stat-badge').textContent.trim()).toBe('-300');
        expect(el.querySelector('.stat-badge').classList).toContain('negative');
    });
});
