import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PerformanceGrades } from '../../data/performance-grades.service';
import { GradeComponent } from './vw-grade.component';

describe('GradeComponent', () => {
    const grades = signal<{ grade: string; delta: number }[] | null>(null);

    beforeEach(() => {
        grades.set(null);
        TestBed.configureTestingModule({
            imports: [GradeComponent],
            providers: [{ provide: PerformanceGrades, useValue: { grades } }]
        });
    });

    const render = (delta: number | undefined) => {
        const fixture = TestBed.createComponent(GradeComponent);
        fixture.componentRef.setInput('delta', delta);
        fixture.detectChanges();
        return fixture;
    };

    it('shows ??? until the grade table has loaded', () => {
        expect(render(1).nativeElement.textContent).toBe('???');
    });

    it('picks the first grade whose delta the value beats', () => {
        grades.set([{ grade: 'A+', delta: 1 }, { grade: 'B', delta: 0 }, { grade: 'F', delta: -99 }]);

        const high = render(2);
        expect(high.nativeElement.textContent).toBe('A+');
        expect(high.nativeElement.querySelector('span').className).toContain('grade-A');

        expect(render(0.5).nativeElement.textContent).toBe('B');
    });

    it('falls back to the lowest grade and shows the delta in the title', () => {
        grades.set([{ grade: 'A+', delta: 1 }, { grade: 'F', delta: -99 }]);

        const fixture = render(-500);
        expect(fixture.nativeElement.textContent).toBe('F');
        expect(fixture.nativeElement.querySelector('span').getAttribute('title')).toBe('Δ-500');
    });
});
