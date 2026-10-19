import { CharacterDirectivesOutlineDirective, CharacterDirectivesOutlineTier, CharacterDirectivesOutlineTree } from '@core/api/models/ps2/character.model';
import { completedObjectives, objectivePercent, tierFill, treeProgress } from './directive-progress';

const directive = (id: number, progress: number, goalValue: number, completionDate?: string): CharacterDirectivesOutlineDirective =>
    ({ id, treeId: 1, tierId: 1, progress, objective: { id, typeId: 1, goalValue }, completionDate });

const tier = (tierId: number, completionPercent: number, completionDate?: string, directives: CharacterDirectivesOutlineDirective[] = []): CharacterDirectivesOutlineTier =>
    ({ tierId, treeId: 1, name: ['Novice', 'Adept', 'Expert', 'Master'][tierId - 1], directivePoints: [5, 10, 25, 100][tierId - 1],
        completionCount: tierId + 1, completionPercent, completionDate, rewards: [], directives });

const tree = (tiers: CharacterDirectivesOutlineTier[]): CharacterDirectivesOutlineTree =>
    ({ id: 1, name: 'Combat Medic', currentDirectiveTierId: 0, currentLevel: 0, tiers });

describe('directive progress', () => {
    it('orders the tiers and finds the rank and the tier being worked on', () => {
        const progress = treeProgress(tree([tier(3, 40), tier(1, 100, '2014-01-01'), tier(4, 5), tier(2, 100, '2015-01-01')]));

        expect(progress.tiers.map(t => t.tierId)).toEqual([1, 2, 3, 4]);
        expect(progress.rank?.name).toBe('Adept');
        expect(progress.current?.name).toBe('Expert');
        expect(progress.currentPercent).toBe(40);
        expect(progress.points).toBe(15);
        expect(progress.status).toBe('inProgress');
    });

    it('treats a tree with every tier completed as mastered', () => {
        const progress = treeProgress(tree([1, 2, 3, 4].map(id => tier(id, 100, '2020-01-01'))));

        expect(progress.status).toBe('mastered');
        expect(progress.rank?.name).toBe('Master');
        expect(progress.current).toBeUndefined();
        expect(progress.points).toBe(140);
    });

    it('treats a tree without progress as not started', () => {
        expect(treeProgress(tree([1, 2, 3, 4].map(id => tier(id, 0)))).status).toBe('notStarted');
        expect(treeProgress(tree([tier(1, 5), tier(2, 0)])).status).toBe('inProgress');
    });

    it('caps progress the API reports beyond what a tier needs', () => {
        const overdone = tier(2, 166.7, undefined, [directive(1, 0, 1, '2020-01-01'), directive(2, 0, 1, '2020-01-01'), directive(3, 0, 1, '2020-01-01'), directive(4, 0, 1, '2020-01-01')]);
        const progress = treeProgress(tree([tier(1, 100, '2014-01-01'), overdone]));

        expect(progress.currentPercent).toBe(100);
        expect(completedObjectives(overdone)).toBe(3);
        expect(progress.currentCompleted).toBe(3);
    });

    it('fills completed tiers, the current one partly and later ones not at all', () => {
        const progress = treeProgress(tree([tier(1, 100, '2014-01-01'), tier(2, 30), tier(3, 136.6), tier(4, 10)]));

        expect(progress.tiers.map(t => tierFill(progress, t))).toEqual([100, 30, 0, 0]);
    });

    it('works out objective progress, counting completed objectives as done', () => {
        expect(objectivePercent(directive(1, 190, 250))).toBe(76);
        expect(objectivePercent(directive(1, 300, 250))).toBe(100);
        expect(objectivePercent(directive(1, 3, 250, '2020-01-01'))).toBe(100);
        expect(objectivePercent(directive(1, 3, 0))).toBe(0);
    });
});
