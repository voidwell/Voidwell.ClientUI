import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StatGrade } from '@core/api/models/ps2/reference.model';
import { GradesRepository } from '@core/api/ps2/grades.repository';

@Injectable()
export class PerformanceGrades {
    private gradesRepository = inject(GradesRepository);

    /** Letter grades by delta; `null` until loaded. */
    readonly grades = toSignal(
        this.gradesRepository.getGrades().pipe(catchError(() => EMPTY)),
        { initialValue: null as StatGrade[] | null });
}
