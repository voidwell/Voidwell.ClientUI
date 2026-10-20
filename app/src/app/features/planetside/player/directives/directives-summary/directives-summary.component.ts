import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { DirectivesSummary } from '../directive-progress';

/** A player's directive points, mastered and in-progress trees, and the trees by rank. */
@Component({
    selector: 'directives-summary',
    templateUrl: './directives-summary.component.html',
    styleUrls: ['./directives-summary.component.css'],
    imports: [MatIcon, DecimalPipe]
})
export class DirectivesSummaryComponent {
    readonly summary = input.required<DirectivesSummary>();
}
