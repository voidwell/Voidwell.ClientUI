import { Component, DestroyRef, ElementRef, computed, effect, inject, input, signal, untracked, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import * as d3 from 'd3';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PopulationPeriod } from '@core/api/models/ps2/common.model';
import { WorldRepository } from '@core/api/ps2/world.repository';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ChipOption, ChipsComponent } from '@shared/ui/vw-chips/vw-chips.component';
import { escapeHtml } from '../../population/population-figures';
import { PopulationPoint, PopulationWorld, WorldPopulationSeries, populationSeries } from './worlds-population-figures';

/** The hours of history plotted, as on a server's activity page. */
const PERIOD_HOURS = 1;
const MARGIN = { top: 8, right: 12, bottom: 26, left: 44 };

/**
 * The players online on each server over the last hour, a line each with the three factions added up. The chips narrow
 * the chart to one server.
 */
@Component({
    selector: 'worlds-population-card',
    templateUrl: './worlds-population-card.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, ChipsComponent, LoaderComponent]
})
export class WorldsPopulationCardComponent {
    private worldRepository = inject(WorldRepository);
    private destroyRef = inject(DestroyRef);

    readonly worlds = input.required<PopulationWorld[]>();

    private readonly graph = viewChild<ElementRef<HTMLElement>>('graph');
    private readonly tooltip = viewChild<ElementRef<HTMLElement>>('tooltip');

    /** The history of each server, or `null` while it loads. */
    private readonly histories = signal<Record<number, PopulationPeriod[]> | null>(null);
    /** The server the chart is narrowed to; every server's line when `null`. */
    readonly selected = signal<number | null>(null);

    readonly isLoading = computed(() => this.histories() === null);
    private readonly series = computed(() => populationSeries(this.worlds(), this.histories() ?? {}));
    readonly shown = computed(() => this.series().filter(series => series.points.length && (this.selected() === null || series.id === this.selected())));
    readonly hasData = computed(() => this.shown().length > 0);
    readonly options = computed<ChipOption<number | null>[]>(() => [
        { value: null, label: 'All servers' },
        ...this.series().map(series => ({ value: series.id, label: series.name }))
    ]);

    constructor() {
        effect(() => {
            const worlds = this.worlds();
            untracked(() => this.load(worlds));
        });

        effect(() => {
            const shown = this.shown();
            const graph = this.graph()?.nativeElement;
            const tooltip = this.tooltip()?.nativeElement;
            if (graph && tooltip) {
                this.draw(graph, tooltip, shown);
            }
        });

        effect(onCleanup => {
            const graph = this.graph()?.nativeElement;
            if (!graph || typeof ResizeObserver === 'undefined') {
                return;
            }

            let width = graph.offsetWidth;
            const observer = new ResizeObserver(() => {
                if (Math.abs(graph.offsetWidth - width) > 1) {
                    width = graph.offsetWidth;
                    this.draw(graph, this.tooltip()?.nativeElement, untracked(this.shown));
                }
            });
            observer.observe(graph);
            onCleanup(() => observer.disconnect());
        });
    }

    private load(worlds: PopulationWorld[]): void {
        this.histories.set(null);
        if (!worlds.length) {
            this.histories.set({});
            return;
        }

        forkJoin(worlds.map(world => this.worldRepository.getWorldActivity(world.id, PERIOD_HOURS).pipe(
            map(activity => [world.id, activity.historicalPopulations ?? []] as const),
            catchError(() => of([world.id, [] as PopulationPeriod[]] as const))
        )))
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(entries => this.histories.set(Object.fromEntries(entries)));
    }

    private draw(graph: HTMLElement, tooltipElement: HTMLElement | undefined, shown: WorldPopulationSeries[]): void {
        d3.select(graph).selectAll('*').remove();

        const width = graph.offsetWidth;
        const height = graph.offsetHeight;
        if (!shown.length || !width || !height) {
            return;
        }

        const innerWidth = width - MARGIN.left - MARGIN.right;
        const innerHeight = height - MARGIN.top - MARGIN.bottom;
        const points = shown.flatMap(series => series.points);
        const x = d3.scaleUtc().domain(d3.extent(points, point => point.timestamp) as [Date, Date]).range([0, innerWidth]);
        const y = d3.scaleLinear().domain([0, d3.max(points, point => point.total) || 1]).nice().range([innerHeight, 0]);

        const svg = d3.select(graph).append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

        svg.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x).ticks(Math.max(2, Math.floor(innerWidth / 90))).tickFormat(date => d3.utcFormat('%H:%M')(date as Date)));
        svg.append('g').call(d3.axisLeft(y).ticks(5));

        const line = d3.line<PopulationPoint>().x(point => x(point.timestamp)).y(point => y(point.total));
        for (const series of shown) {
            svg.append('path')
                .attr('class', 'line')
                .attr('fill', 'none')
                .attr('stroke', series.color)
                .attr('d', line(series.points));
        }

        const tipLine = svg.append('line').attr('y1', 0).attr('y2', innerHeight).style('display', 'none');
        const tooltip = tooltipElement ? d3.select(tooltipElement) : null;
        const bisect = d3.bisector((point: PopulationPoint) => point.timestamp).center;

        svg.append('rect')
            .attr('width', innerWidth)
            .attr('height', innerHeight)
            .attr('fill', 'transparent')
            .on('mousemove', (event: MouseEvent) => {
                const at = x.invert(d3.pointer(event)[0]);
                const rows = shown
                    .map(series => ({ series, point: series.points[bisect(series.points, at)] }))
                    .sort((a, b) => b.point.total - a.point.total);
                const moment = rows[0].point.timestamp;
                const [left, top] = d3.pointer(event, tooltipElement?.parentElement);
                tipLine.style('display', null).attr('x1', x(moment)).attr('x2', x(moment));
                tooltip?.style('display', 'block')
                    .style('left', `${left + 16}px`)
                    .style('top', `${top - 16}px`)
                    .html(`<div>${d3.utcFormat('%H:%M UTC')(moment)}</div>` + rows.map(row =>
                        `<div><span class="stat-swatch" style="background:${row.series.color}"></span>${escapeHtml(row.series.name)}<span style="margin-left:auto;padding-left:16px">${row.point.total}</span></div>`).join(''));
            })
            .on('mouseout', () => {
                tipLine.style('display', 'none');
                tooltip?.style('display', 'none');
            });
    }
}
