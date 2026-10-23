import { Component, input } from '@angular/core';
import { GradeComponent } from '../vw-grade/vw-grade.component';

/**
 * A figure with its grade badge beside it. Without a delta the badge's space is kept empty, so figures in a column
 * line up whether or not they are graded.
 */
@Component({
    selector: 'vw-graded-figure',
    template: `<span class="value"><ng-content></ng-content></span>@if (delta() != null) {<vw-grade class="badge" [delta]="delta()!"></vw-grade>} @else {<span class="badge placeholder" aria-hidden="true"></span>}`,
    styleUrls: ['./graded-figure.component.css'],
    imports: [GradeComponent]
})
export class GradedFigureComponent {
    readonly delta = input<number | null | undefined>();
}
