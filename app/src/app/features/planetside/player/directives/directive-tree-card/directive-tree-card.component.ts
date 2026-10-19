import { Component, computed, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { DgcImageUrlPipe } from '../../../pipes/dgc-image-url.pipe';
import { DirectiveTreeProgress, tierColor, tierFill } from '../directive-progress';

/** A directive tree in the directives grid: its rank, progress through each tier and points earned. */
@Component({
    selector: 'directive-tree-card',
    templateUrl: './directive-tree-card.component.html',
    styleUrls: ['./directive-tree-card.component.css'],
    imports: [MatIcon, DatePipe, DecimalPipe, DgcImageUrlPipe]
})
export class DirectiveTreeCardComponent {
    readonly progress = input.required<DirectiveTreeProgress>();

    readonly rankColor = computed(() => tierColor(this.progress().rank));

    readonly segments = computed(() => {
        const progress = this.progress();
        return progress.tiers.map(tier => ({ tier, fill: tierFill(progress, tier), color: tierColor(tier) }));
    });
}
