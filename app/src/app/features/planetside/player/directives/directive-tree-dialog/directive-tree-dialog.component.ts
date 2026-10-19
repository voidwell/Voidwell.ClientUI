import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { CharacterDirectivesOutlineTier } from '@core/api/models/ps2/character.model';
import { DgcImageUrlPipe } from '../../../pipes/dgc-image-url.pipe';
import { DirectiveTreeProgress, completedObjectives, distinctRewards, isCompleted, objectivePercent, tierColor, tierFill } from '../directive-progress';

export interface DirectiveTreeDialogData {
    progress: DirectiveTreeProgress;
}

/** One directive tree in detail: its tiers, and the rewards and objectives of the selected one. */
@Component({
    selector: 'directive-tree-dialog',
    templateUrl: './directive-tree-dialog.component.html',
    styleUrls: ['./directive-tree-dialog.component.css'],
    imports: [MatDialogTitle, MatDialogContent, MatDialogClose, MatIconButton, MatIcon, DatePipe, DecimalPipe, DgcImageUrlPipe]
})
export class DirectiveTreeDialog {
    readonly progress = inject<DirectiveTreeDialogData>(MAT_DIALOG_DATA).progress;

    readonly tierColor = tierColor;
    readonly rankColor = tierColor(this.progress.rank);
    readonly totalPoints = this.progress.tiers.reduce((sum, tier) => sum + (tier.directivePoints ?? 0), 0);

    /** Opens on the tier being worked on, or the last one once the tree is mastered. */
    readonly selected = signal<CharacterDirectivesOutlineTier>(
        this.progress.current ?? this.progress.tiers[this.progress.tiers.length - 1]);

    readonly steps = this.progress.tiers.map(tier => ({
        tier,
        color: tierColor(tier),
        fill: tierFill(this.progress, tier),
        completed: isCompleted(tier),
        current: tier === this.progress.current
    }));

    readonly rewards = computed(() => distinctRewards(this.selected().rewards));

    readonly selectedCompleted = computed(() => completedObjectives(this.selected()));

    /** Objectives of the selected tier, completed ones last so what is left to do comes first. */
    readonly objectives = computed(() => [...this.selected().directives]
        .sort((a, b) => Number(isCompleted(a)) - Number(isCompleted(b)))
        .map(directive => ({ directive, percent: objectivePercent(directive), completed: isCompleted(directive) })));

    /** One pip per objective the selected tier needs. */
    readonly requirementPips = computed(() =>
        Array.from({ length: this.selected().completionCount }, (_, i) => i < this.selectedCompleted()));
}
