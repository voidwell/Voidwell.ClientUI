import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PerformanceGrades } from './../../performance-grades.service';

@Component({
    selector: 'vw-grade',
    template: '<span class="vw-grade" [ngClass]="gradeClass" [attr.title]="getDelta()">{{grade}}</span>',
    styleUrls: ['./vw-grade.styles.css']
})

export class GradeComponent implements OnInit, OnDestroy {
    @Input() delta: number;

    grade: string = '???';
    gradeClass: string;

    private gradeSub: Subscription;

    constructor(private gradesService: PerformanceGrades) {        
    }

    ngOnInit() {
        this.gradeSub = this.gradesService.Grades.subscribe(grades => {
            if (grades == null) { return; }

            let newGrade;
            for (let i = 0; i < grades.length; i++) {
                if (this.delta > grades[i].delta) {
                    newGrade = grades[i].grade;
                    break;
                }
            }

            if (!newGrade) {
                newGrade = grades[grades.length - 1].grade;
            }

            this.grade = newGrade;
            this.gradeClass = 'grade-' + this.grade[0];
        });
    }

    public getDelta() {
        var sDelta = "Δ";
        if (this.delta) {
            sDelta += Number(this.delta).toPrecision(3);
        }
        return sDelta;
    }

    ngOnDestroy() {
        this.gradeSub.unsubscribe();
    }
}