import { afterNextRender, Component, computed, DestroyRef, ElementRef, inject, input, signal } from '@angular/core';

export interface LinePoint {
    x: number;
    /** `null` leaves a gap: the point is not known. */
    y: number | null;
}

export interface LineSeries {
    label: string;
    color: string;
    points: readonly LinePoint[];
}

/** The width drawn before the chart has been measured. */
const DEFAULT_WIDTH = 640;
const HEIGHT = 240;
const PAD = { left: 52, right: 12, top: 12, bottom: 28 };
const GRID_LINES = 4;

/** Rounds a span up to a step of 1, 2 or 5 times a power of ten, so the axis reads in round numbers. */
function niceCeil(value: number): number {
    if (value <= 0) {
        return 1;
    }
    const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
    const scaled = value / magnitude;
    return (scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10) * magnitude;
}

/**
 * One or more lines over a shared x axis, with a quiet grid and a legend; each point carries its figure as hover text.
 * The chart is drawn at the width it is given, so its text stays the same size however wide the card is.
 */
@Component({
    selector: 'dl-line-chart',
    templateUrl: './deadlock-line-chart.component.html',
    styleUrl: './deadlock-line-chart.component.css'
})
export class DeadlockLineChartComponent {
    readonly series = input.required<readonly LineSeries[]>();
    readonly xLabel = input<(x: number) => string>(x => String(x));
    readonly yLabel = input<(y: number) => string>(y => String(y));
    /** Start the y axis at the smallest value instead of at zero; a rate near 50% is easier to read that way. */
    readonly fitY = input(false);
    readonly label = input<string>();

    readonly height = HEIGHT;
    readonly padLeft = PAD.left;
    readonly width = signal(DEFAULT_WIDTH);
    readonly right = computed(() => this.width() - PAD.right);

    constructor() {
        const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
        const destroyRef = inject(DestroyRef);

        afterNextRender(() => {
            const measure = () => {
                const width = Math.round(host.clientWidth);
                if (width > 0) {
                    this.width.set(Math.max(width, 240));
                }
            };

            measure();
            if (typeof ResizeObserver !== 'undefined') {
                const observer = new ResizeObserver(measure);
                observer.observe(host);
                destroyRef.onDestroy(() => observer.disconnect());
            }
        });
    }

    private readonly xs = computed(() => [...new Set(this.series().flatMap(series => series.points.map(point => point.x)))].sort((a, b) => a - b));

    private readonly yRange = computed(() => {
        const values = this.series().flatMap(series => series.points.map(point => point.y)).filter((y): y is number => y !== null);
        if (!values.length) {
            return { min: 0, max: 1 };
        }

        const max = Math.max(...values);
        if (!this.fitY()) {
            return { min: 0, max: niceCeil(max) };
        }

        const min = Math.min(...values);
        const step = niceCeil((max - min || Math.abs(max) || 1) / GRID_LINES);
        const low = Math.floor(min / step) * step;
        return { min: low, max: Math.max(Math.ceil(max / step) * step, low + step * GRID_LINES) };
    });

    private x(x: number): number {
        const xs = this.xs();
        const span = xs[xs.length - 1] - xs[0];
        return PAD.left + (span > 0 ? (x - xs[0]) / span : 0.5) * (this.width() - PAD.left - PAD.right);
    }

    private y(y: number): number {
        const { min, max } = this.yRange();
        return HEIGHT - PAD.bottom - ((y - min) / (max - min || 1)) * (HEIGHT - PAD.top - PAD.bottom);
    }

    readonly grid = computed(() => {
        const { min, max } = this.yRange();
        return Array.from({ length: GRID_LINES + 1 }, (_, index) => {
            const value = min + ((max - min) * index) / GRID_LINES;
            return { y: this.y(value), label: this.yLabel()(value) };
        });
    });

    /** The x labels, thinned so that neighbours do not touch: one per 56px at the most. */
    readonly ticks = computed(() => {
        const xs = this.xs();
        const room = Math.max(1, Math.floor((this.width() - PAD.left - PAD.right) / 56));
        const every = Math.max(1, Math.ceil(xs.length / room));
        return xs.filter((_, index) => index % every === 0).map(x => ({ x: this.x(x), label: this.xLabel()(x) }));
    });

    readonly lines = computed(() => this.series().map(series => {
        // A gap in the data breaks the line instead of joining the points either side of it.
        let path = '';
        let pen = false;
        for (const point of series.points) {
            if (point.y === null) {
                pen = false;
                continue;
            }
            path += `${pen ? 'L' : 'M'}${this.x(point.x).toFixed(1)},${this.y(point.y).toFixed(1)}`;
            pen = true;
        }

        return {
            label: series.label,
            color: series.color,
            path,
            dots: series.points
                .filter(point => point.y !== null)
                .map(point => ({ cx: this.x(point.x), cy: this.y(point.y as number), title: `${series.label}, ${this.xLabel()(point.x)}: ${this.yLabel()(point.y as number)}` }))
        };
    }));
}
