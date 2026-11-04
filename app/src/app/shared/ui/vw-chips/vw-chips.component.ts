import { Component, input, output } from '@angular/core';
import { DecimalPipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

/** One choice of a chip group: what it selects, how it reads, and optionally how many items it would show. */
export interface ChipOption<T> {
    value: T;
    label: string;
    count?: number | null;
    /** Classes for the count, such as a faction colour. */
    countClass?: string;
    /** A colour dot shown before the label, such as a chart line's colour. */
    swatch?: string | null;
    /** Makes the chip a link to this route instead of a button; the chip is marked as picked while the route is active. */
    link?: string;
}

/**
 * A row of chips, for filters, ranges and toggles. `choose` reports the chip clicked.
 * - Single choice: `value` is the chip shown as picked.
 * - Several at once: `values` lists every chip shown as picked, and the parent flips the one `choose` reports.
 * - Navigation: options with a `link` are anchors that follow it.
 */
@Component({
    selector: 'vw-chips',
    templateUrl: './vw-chips.component.html',
    styleUrl: './vw-chips.component.css',
    imports: [DecimalPipe, NgClass, NgTemplateOutlet, RouterLink, RouterLinkActive]
})
export class ChipsComponent<T> {
    readonly options = input.required<readonly ChipOption<T>[]>();
    /** The picked chip, when only one can be. */
    readonly value = input<T | null>(null);
    /** Every picked chip, when several can be; takes the place of `value`. */
    readonly values = input<readonly T[] | null>(null);
    readonly choose = output<T>();
    /** Names the group for assistive technology. */
    readonly label = input<string>();
    readonly disabled = input(false);

    isPicked(option: ChipOption<T>): boolean {
        const values = this.values();
        return values ? values.includes(option.value) : option.value === this.value();
    }
}
