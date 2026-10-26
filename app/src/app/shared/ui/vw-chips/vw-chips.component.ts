import { Component, input, output } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';

/** One choice of a chip group: what it selects, how it reads, and optionally how many items it would show. */
export interface ChipOption<T> {
    value: T;
    label: string;
    count?: number | null;
    /** Classes for the count, such as a faction colour. */
    countClass?: string;
}

/** A row of chips of which one is selected, for filters and ranges. `value` is the choice shown; `choose` reports the one clicked. */
@Component({
    selector: 'vw-chips',
    imports: [DecimalPipe, NgClass],
    template: `
        <div class="flex flex-wrap gap-1.5" role="group" [attr.aria-label]="label()">
            @for (option of options(); track option.value) {
                <button type="button" class="stat-chip" [class.on]="option.value === value()" [attr.aria-pressed]="option.value === value()"
                    [disabled]="disabled()" (click)="choose.emit(option.value)">{{ option.label }}@if (option.count != null) {&ngsp;<span class="stat-chip-count" [ngClass]="option.countClass ?? ''">{{ option.count | number }}</span>}</button>
            }
        </div>`
})
export class ChipsComponent<T> {
    readonly options = input.required<readonly ChipOption<T>[]>();
    readonly value = input<T | null>(null);
    readonly choose = output<T>();
    /** Names the group for assistive technology. */
    readonly label = input<string>();
    readonly disabled = input(false);
}
