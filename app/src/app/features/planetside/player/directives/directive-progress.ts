import { CharacterDirectivesOutlineDirective, CharacterDirectivesOutlineTier, CharacterDirectivesOutlineTree, DirectivesOutlineReward } from '@core/api/models/ps2/character.model';

export type DirectiveTreeStatus = 'mastered' | 'inProgress' | 'notStarted';

/** Accent colour of each tier (by tier id: Novice, Adept, Expert, Master). */
export const TIER_COLORS: Record<number, string> = {
    1: '#c98a4b',
    2: '#b8c4cc',
    3: '#e6b422',
    4: '#b77ee0'
};
export const UNRANKED_COLOR = '#5d7079';

/** A directive tree with its progress worked out, as the page and dialog show it. */
export interface DirectiveTreeProgress {
    tree: CharacterDirectivesOutlineTree;
    /** The tiers in order, Novice first; the API does not always sort them. */
    tiers: CharacterDirectivesOutlineTier[];
    /** The highest completed tier, if any. */
    rank?: CharacterDirectivesOutlineTier;
    /** The tier being worked on; none once the tree is mastered. */
    current?: CharacterDirectivesOutlineTier;
    /** Objectives completed towards the current tier, at most the number it needs. */
    currentCompleted: number;
    /** Progress through the current tier, 0–100. */
    currentPercent: number;
    /** Directive points earned from completed tiers. */
    points: number;
    status: DirectiveTreeStatus;
}

export function clampPercent(value: number | null | undefined): number {
    return Math.min(100, Math.max(0, value ?? 0));
}

export function isCompleted(item: { completionDate?: string }): boolean {
    return !!item.completionDate;
}

/** Objectives of a tier completed, at most the number the tier needs. */
export function completedObjectives(tier: CharacterDirectivesOutlineTier): number {
    return Math.min(tier.completionCount, tier.directives.filter(isCompleted).length);
}

/**
 * A tier's rewards worth listing. Unnamed ones are left out, and a reward that comes in a variant per faction (the
 * same name with a different image) is listed once.
 */
export function distinctRewards(rewards: DirectivesOutlineReward[]): DirectivesOutlineReward[] {
    const names = new Set<string>();
    return rewards.filter(reward => {
        if (!reward.name || names.has(reward.name)) {
            return false;
        }
        names.add(reward.name);
        return true;
    });
}

/** Progress of one objective, 0–100; completed objectives count as done whatever their counter says. */
export function objectivePercent(directive: CharacterDirectivesOutlineDirective): number {
    if (isCompleted(directive)) {
        return 100;
    }
    const goal = directive.objective?.goalValue;
    return goal ? clampPercent((directive.progress ?? 0) / goal * 100) : 0;
}

export function treeProgress(tree: CharacterDirectivesOutlineTree): DirectiveTreeProgress {
    const tiers = [...tree.tiers].sort((a, b) => a.tierId - b.tierId);
    const completed = tiers.filter(isCompleted);
    const rank = completed[completed.length - 1];
    const current = tiers.find(tier => !isCompleted(tier));
    const currentPercent = current ? clampPercent(current.completionPercent) : 100;
    const currentCompleted = current ? completedObjectives(current) : 0;

    const status: DirectiveTreeStatus = !current
        ? 'mastered'
        : rank || currentPercent > 0 || currentCompleted > 0 ? 'inProgress' : 'notStarted';

    return {
        tree,
        tiers,
        rank,
        current,
        currentCompleted,
        currentPercent,
        points: completed.reduce((sum, tier) => sum + (tier.directivePoints ?? 0), 0),
        status
    };
}

/** How full each tier's segment of a tree's progress bar is, 0–100, in tier order. */
export function tierFill(progress: DirectiveTreeProgress, tier: CharacterDirectivesOutlineTier): number {
    if (isCompleted(tier)) {
        return 100;
    }
    return tier === progress.current ? progress.currentPercent : 0;
}

export function tierColor(tier: CharacterDirectivesOutlineTier | undefined): string {
    return (tier && TIER_COLORS[tier.tierId]) ?? UNRANKED_COLOR;
}
