import { Component, computed, inject, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { PerformanceGrades } from '../../data/performance-grades.service';

@Component({
    selector: 'vw-grade',
    template: '<span class="vw-grade" [ngClass]="gradeClass()" [attr.title]="deltaTitle()">{{grade()}}</span>',
    styleUrls: ['./vw-grade.component.css'],
    imports: [NgClass]
})

export class GradeComponent {
    private gradesService = inject(PerformanceGrades);

    readonly delta = input<number>();

    /** The letter grade for the delta, `???` until the grade table has loaded. */
    readonly grade = computed(() => {
        const grades = this.gradesService.grades();
        if (grades == null) {
            return '???';
        }

        const delta = this.delta();
        return (grades.find(g => delta > g.delta) ?? grades[grades.length - 1]).grade;
    });

    readonly gradeClass = computed(() => 'grade-' + this.grade()[0]);

    readonly deltaTitle = computed(() => {
        const delta = this.delta();
        return 'Δ' + (delta ? Number(delta).toPrecision(3) : '');
    });
}
