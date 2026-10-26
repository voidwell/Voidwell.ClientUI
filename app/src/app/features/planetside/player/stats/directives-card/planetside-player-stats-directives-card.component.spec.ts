import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CharacterDetails, CharacterDirectivesOutline, CharacterDirectivesOutlineTier } from '@core/api/models/ps2/character.model';
import { CharacterRepository } from '@core/api/ps2/character.repository';
import { PlanetsidePlayerStatsDirectivesCardComponent } from './planetside-player-stats-directives-card.component';

const tier = (tierId: number, completionDate?: string): CharacterDirectivesOutlineTier =>
    ({ tierId, treeId: 1, completionDate, directivePoints: 10, completionCount: 1, completionPercent: 0, directives: [], rewards: [] });

const OUTLINE = {
    categories: [
        { id: 1, name: 'Weapons', trees: [
            { id: 1, name: 'Mastered', tiers: [tier(1, '2020-01-01'), tier(2, '2020-01-01'), tier(3, '2020-01-01'), tier(4, '2020-01-01')] },
            { id: 2, name: 'Started', tiers: [tier(1, '2020-01-01'), tier(2), tier(3), tier(4)] }
        ] }
    ]
} as unknown as CharacterDirectivesOutline;

describe('PlanetsidePlayerStatsDirectivesCardComponent', () => {
    const setup = (getDirectives: () => unknown) => {
        TestBed.configureTestingModule({
            providers: [provideRouter([]), { provide: CharacterRepository, useValue: { getDirectives } }]
        });
        const fixture = TestBed.createComponent(PlanetsidePlayerStatsDirectivesCardComponent);
        fixture.componentRef.setInput('player', { id: '42' } as CharacterDetails);
        fixture.detectChanges();
        return fixture;
    };

    it('sums up the player\'s directives and links to the Directives page', () => {
        const fixture = setup(() => of(OUTLINE));
        const summary = fixture.componentInstance.summary();

        expect(summary?.mastered).toBe(1);
        expect(summary?.total).toBe(2);
        expect(fixture.nativeElement.querySelector('directives-summary')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('.stat-action').getAttribute('href')).toBe('/ps2/player/42/directives');
    });

    it('says so when the directives cannot be loaded', () => {
        const fixture = setup(() => throwError(() => new Error('down')));

        expect(fixture.nativeElement.querySelector('.muted').textContent).toContain('unavailable');
    });
});
