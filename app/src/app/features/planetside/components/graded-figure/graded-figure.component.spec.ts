import { TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { PerformanceGrades } from '../../data/performance-grades.service';
import { GradedFigureComponent } from './graded-figure.component';

@Component({
    template: '<vw-graded-figure [delta]="delta()">1.25</vw-graded-figure>',
    imports: [GradedFigureComponent]
})
class HostComponent {
    readonly delta = signal<number | undefined>(0.5);
}

describe('GradedFigureComponent', () => {
    it('shows a grade beside the figure, or keeps its space when there is none', () => {
        TestBed.configureTestingModule({
            providers: [{ provide: PerformanceGrades, useValue: { grades: signal([{ grade: 'A', delta: 0 }, { grade: 'F', delta: -99 }]) } }]
        });
        const fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
        const element = fixture.nativeElement as HTMLElement;

        expect(element.querySelector('.value')?.textContent).toBe('1.25');
        expect(element.querySelector('vw-grade')?.textContent).toBe('A');

        fixture.componentInstance.delta.set(undefined);
        fixture.detectChanges();
        expect(element.querySelector('vw-grade')).toBeNull();
        expect(element.querySelector('.placeholder')).not.toBeNull();
    });
});
