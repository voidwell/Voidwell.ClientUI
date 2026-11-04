import { TestBed } from '@angular/core/testing';
import { CharacterDetails, CharacterDetailsStatsHistory } from '@core/api/models/ps2/character.model';
import { PlanetsidePlayerStatsRecentTrendsCardComponent } from './planetside-player-stats-recent-trends-card.component';

const today = new Date();
const saved = today.toISOString();
const row = (statName: string, day: number[], allTime: number): CharacterDetailsStatsHistory =>
    ({ statName, allTime, oneLifeMax: 0, day, week: [], month: [], lastSaveDate: saved });

describe('PlanetsidePlayerStatsRecentTrendsCardComponent', () => {
    const render = (history: CharacterDetailsStatsHistory[]) => {
        const fixture = TestBed.createComponent(PlanetsidePlayerStatsRecentTrendsCardComponent);
        fixture.componentRef.setInput('player', { statsHistory: history, times: { lastSaveDate: saved } } as CharacterDetails);
        fixture.detectChanges();
        return { fixture, el: fixture.nativeElement as HTMLElement };
    };

    const history = [
        row('kills', [60, 0, 40], 1000),
        row('deaths', [20, 0, 20], 1000),
        row('time', [3600, 0, 3600], 36000),
        row('score', [24000, 0, 24000], 1),
        row('facility_capture', [2, 0, 1], 0),
        row('facility_defend', [0, 0, 3], 0)
    ];

    const tile = (el: HTMLElement, label: string) =>
        Array.from(el.querySelectorAll('.stat-tile')).find(t => t.querySelector('.stat-label').textContent.trim() === label) as HTMLElement;

    it('shows the period figures against lifetime', () => {
        const { el } = render(history);

        expect(tile(el, 'KDR').querySelector('.stat-tile-value').textContent.trim()).toBe('2.50');
        expect(tile(el, 'KDR').querySelector('.trend-change').textContent).toContain('150%');
        expect(tile(el, 'KDR').querySelector('.trend-change').classList).toContain('up');
        expect(tile(el, 'KDR').querySelector('.stat-tile-sub').textContent).toContain('Lifetime 1.00');
        expect(tile(el, 'Kills / hour').querySelector('.stat-tile-value').textContent.trim()).toBe('50.0');
        expect(tile(el, 'Time played').querySelector('.stat-tile-sub').textContent).toContain('2 of 30 days active');
        expect(tile(el, 'Bases').querySelector('.stat-tile-value').textContent.trim()).toBe('3 / 3');
    });

    it('leaves days without play empty and draws a lifetime line for ratios', () => {
        const { el } = render(history);

        expect(el.querySelectorAll('.bar')).toHaveLength(30);
        expect(el.querySelectorAll('.fill.up')).toHaveLength(2);
        expect(el.querySelector('.lifetime')).not.toBeNull();
    });

    it('draws kills above and deaths below the zero line', () => {
        const { fixture, el } = render(history);
        fixture.componentInstance.metric.set('kills');
        fixture.detectChanges();

        expect(el.querySelector('.plot').classList).toContain('diverging');
        expect(el.querySelectorAll('.fill.up')).toHaveLength(2);
        expect(el.querySelectorAll('.fill.down')).toHaveLength(2);
        expect(el.querySelector('.lifetime')).toBeNull();
        expect(Array.from(el.querySelectorAll('.axis span')).map(s => s.textContent.trim())).toEqual(['100', '0', '100']);
    });

    it('says so when nothing was played in the period', () => {
        const { el } = render(history.map(r => ({ ...r, day: [] as number[] })));

        expect(el.querySelector('.stat-empty').textContent).toContain('No play in the last 30 days');
        expect(tile(el, 'KDR').querySelector('.stat-tile-value').textContent.trim()).toBe('—');
        expect(tile(el, 'KDR').querySelector('.trend-change')).toBeNull();
    });
});
