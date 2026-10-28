import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ChipOption, ChipsComponent } from './vw-chips.component';

@Component({
    imports: [ChipsComponent],
    template: `<vw-chips label="Kind" [options]="options" [value]="value()" (choose)="value.set($event)" [disabled]="disabled()" />`
})
class HostComponent {
    readonly options: ChipOption<string | null>[] = [
        { value: null, label: 'All', count: 12 },
        { value: 'a', label: 'Alpha', count: 0, countClass: 'faction-vs-text' },
        { value: 'b', label: 'Beta' }
    ];
    readonly value = signal<string | null>('a');
    readonly disabled = signal(false);
}

function create() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const chips = () => [...fixture.nativeElement.querySelectorAll('button.stat-chip')] as HTMLButtonElement[];
    return { fixture, chips };
}

describe('ChipsComponent', () => {
    it('shows a chip for each option with its count, and marks the selected one', () => {
        const { fixture, chips } = create();

        expect(chips().map(chip => chip.textContent?.replace(/\s+/g, ' ').trim())).toEqual(['All 12', 'Alpha 0', 'Beta']);
        expect(chips().map(chip => chip.getAttribute('aria-pressed'))).toEqual(['false', 'true', 'false']);
        expect(chips().map(chip => chip.classList.contains('on'))).toEqual([false, true, false]);
        expect(fixture.nativeElement.querySelector('[role="group"]').getAttribute('aria-label')).toBe('Kind');
    });

    it('classes the count of an option that asks for it', () => {
        const { chips } = create();

        expect(chips()[1].querySelector('.stat-chip-count')?.classList).toContain('faction-vs-text');
        expect(chips()[2].querySelector('.stat-chip-count')).toBeNull();
    });

    it('selects the chip that is clicked, including the one whose value is null', () => {
        const { fixture, chips } = create();

        chips()[2].click();
        fixture.detectChanges();
        expect(fixture.componentInstance.value()).toBe('b');
        expect(chips()[2].classList.contains('on')).toBe(true);

        chips()[0].click();
        fixture.detectChanges();
        expect(fixture.componentInstance.value()).toBeNull();
        expect(chips()[0].classList.contains('on')).toBe(true);
    });

    it('can be disabled', () => {
        const { fixture, chips } = create();

        fixture.componentInstance.disabled.set(true);
        fixture.detectChanges();

        expect(chips().every(chip => chip.disabled)).toBe(true);
    });
});
