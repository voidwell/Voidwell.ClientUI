import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';
import { PlanetsideApi } from './planetside-api.service';

@Injectable()
export class PerformanceGrades {
    public Grades: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private ps2Api: PlanetsideApi) {
        ps2Api.getGrades().subscribe(grades => {
            if (grades != null) {
                this.Grades.next(grades);
            }
        });
    }
}