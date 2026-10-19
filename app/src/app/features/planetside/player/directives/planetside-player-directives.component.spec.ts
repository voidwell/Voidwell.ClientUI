import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { CharacterDetails, CharacterDirectivesOutline, CharacterDirectivesOutlineTier, CharacterDirectivesOutlineTree } from '@core/api/models/ps2/character.model';
import { CharacterRepository } from '@core/api/ps2/character.repository';
import { PlanetsidePlayerComponent } from '../planetside-player.component';
import { PlanetsidePlayerDirectivesComponent } from './planetside-player-directives.component';

/** A tree whose first `completedTiers` tiers are done and whose next one is `percent` complete. */
const tree = (id: number, name: string, completedTiers: number, percent = 0): CharacterDirectivesOutlineTree => ({
    id,
    name,
    currentDirectiveTierId: completedTiers + 1,
    currentLevel: 0,
    tiers: [1, 2, 3, 4].map((tierId): CharacterDirectivesOutlineTier => ({
        tierId,
        treeId: id,
        name: ['Novice', 'Adept', 'Expert', 'Master'][tierId - 1],
        directivePoints: [5, 10, 25, 100][tierId - 1],
        completionCount: 2,
        completionPercent: tierId <= completedTiers ? 100 : tierId === completedTiers + 1 ? percent : 0,
        completionDate: tierId <= completedTiers ? '2020-01-01' : undefined,
        rewards: [],
        directives: []
    }))
});

const OUTLINE: CharacterDirectivesOutline = {
    categories: [
        { id: 3, name: 'Infantry', trees: [tree(1, 'Combat Medic', 3, 40), tree(2, 'Light Assault', 4)] },
        { id: 7, name: 'Weapons', trees: [tree(3, 'Carbines', 4), tree(4, 'Scout Rifles', 0)] }
    ]
};

describe('PlanetsidePlayerDirectivesComponent', () => {
    const setup = (getDirectives: () => unknown) => {
        TestBed.configureTestingModule({
            providers: [
                { provide: PlanetsidePlayerComponent, useValue: { playerData: signal({ id: '42' } as CharacterDetails) } },
                { provide: CharacterRepository, useValue: { getDirectives } }
            ]
        });
        const fixture = TestBed.createComponent(PlanetsidePlayerDirectivesComponent);
        fixture.detectChanges();
        return fixture.componentInstance;
    };
    const names = (component: PlanetsidePlayerDirectivesComponent) => component.groups().flatMap(g => g.trees.map(t => t.tree.name));

    it('sums up the trees by rank', () => {
        const component = setup(() => of(OUTLINE));
        const summary = component.summary();

        expect(summary.points).toBe(140 * 2 + 40);
        expect(summary.mastered).toBe(2);
        expect(summary.inProgress).toBe(1);
        expect(summary.ranks.map(r => [r.name, r.count])).toEqual([['Master', 2], ['Expert', 1], ['Adept', 0], ['Novice', 0], ['Unranked', 1]]);
    });

    it('filters by category, status and name', () => {
        const component = setup(() => of(OUTLINE));
        expect(names(component)).toEqual(['Combat Medic', 'Light Assault', 'Carbines', 'Scout Rifles']);

        component.category.set(7);
        expect(names(component)).toEqual(['Carbines', 'Scout Rifles']);

        component.status.set('mastered');
        expect(names(component)).toEqual(['Carbines']);

        component.category.set(null);
        component.search.set(' LIGHT ');
        expect(names(component)).toEqual(['Light Assault']);
    });

    it('leaves out categories with no matching tree but keeps their mastered count', () => {
        const component = setup(() => of(OUTLINE));
        component.status.set('notStarted');

        expect(component.groups().map(g => [g.name, g.mastered, g.total])).toEqual([['Weapons', 1, 2]]);
    });

    it('shows an error when the directives fail to load', () => {
        const component = setup(() => throwError(() => new Error('down')));

        expect(component.errorMessage()).toBeTruthy();
        expect(component.categories()).toBeUndefined();
    });
});
