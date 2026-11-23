import { Component, computed, input } from '@angular/core';

/** One bar: its caption under the bar, its value, and the text shown on hover. */
export interface BarPoint {
    label: string;
    value: number;
    title?: string;
}

/** A row of vertical bars in proportion to the largest one. Bars are quiet; the figures live in the hover text. */
@Component({
    selector: 'dl-bar-chart',
    templateUrl: './deadlock-bar-chart.component.html',
    styleUrl: './deadlock-bar-chart.component.css'
})
export class DeadlockBarChartComponent {
    readonly bars = input.required<readonly BarPoint[]>();
    /** Caption every n-th bar only, when there are too many to caption each. */
    readonly labelEvery = input(1);
    /** Names the chart for assistive technology. */
    readonly label = input<string>();

    readonly scaled = computed(() => {
        const bars = this.bars();
        const max = Math.max(0, ...bars.map(bar => bar.value));
        return bars.map((bar, index) => ({
            ...bar,
            height: max > 0 ? Math.max(bar.value > 0 ? 2 : 0, (bar.value / max) * 100) : 0,
            captioned: index % this.labelEvery() === 0
        }));
    });
}
