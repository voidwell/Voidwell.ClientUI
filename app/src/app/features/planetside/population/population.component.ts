import { ChangeDetectorRef, Component, OnInit, ElementRef, DestroyRef, Injector, ViewChild, computed, effect, inject, untracked, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DecimalPipe, NgClass } from '@angular/common';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { WorldService } from '../data/world.service';
import * as d3 from 'd3';
import { WorldRepository } from '@core/api/ps2/world.repository';
import { World, WorldPopulationHistory } from '@core/api/models/ps2/world.model';
import { getErrorMessage } from '@core/util/error-message';
import { definedParams } from '@shared/utils/query-params';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { cellOf, sortRows } from '../components/combat-report/combat-report-figures';
import { FactionColorPipe } from '../pipes/faction-color.pipe';
import { PopulationRow, dailyTotal, escapeHtml, populationRows, selectionDiffers } from './population-figures';

@Component({
    templateUrl: './population.component.html',
    styleUrls: ['./population.component.css'],
    imports: [MatCard, MatCardTitle, MatCardContent, MatSort, MatSortHeader, MatIcon, RouterLink, NgClass, DecimalPipe, FactionColorPipe, MatButton, LoaderComponent, MatFormField, MatInput, MatDatepickerInput, FormsModule, ReactiveFormsModule, MatDatepickerToggle, MatSuffix, MatDatepicker]
})

export class PopulationComponent implements OnInit {
    readonly startDate = input<string>();
    readonly endDate = input<string>();
    readonly worlds = input<string>();
    private router = inject(Router);
    private worldRepository = inject(WorldRepository);
    private worldService = inject(WorldService);
    private injector = inject(Injector);
    private cdr = inject(ChangeDetectorRef);
    private destroyRef = inject(DestroyRef);

    @ViewChild('linegraph', { static: true }) graphElement: ElementRef<HTMLElement>;

    isLoading: boolean;
    errorMessage: string = null;

    /** The zoom shortcuts above the chart. */
    readonly ranges = [
        { id: '1m', display: '1m' }, { id: '3m', display: '3m' }, { id: '6m', display: '6m' },
        { id: 'ytd', display: 'YTD' }, { id: '1y', display: '1y' }, { id: 'all', display: 'All' }
    ];

    /** The faction columns of the table, with the faction ids that colour them. */
    readonly factions = [
        { key: 'vs', id: 1, code: 'VS' }, { key: 'nc', id: 2, code: 'NC' }, { key: 'tr', id: 3, code: 'TR' }, { key: 'ns', id: 4, code: 'NS' }
    ] as const;

    selectedStartDate = new FormControl();
    selectedEndDate = new FormControl();

    availableWorlds: World[] = [];
    stats: WorldPopulationHistory = {};
    selectedWorlds: World[] = [];
    graphWorlds: World[] = [];

    /** The zoom range last picked, until the chart is zoomed or the dates are changed by hand. */
    readonly activeRange = signal<string | null>(null);
    readonly sort = signal<Sort>({ active: 'latest', direction: 'desc' });
    /** The servers plotted, with the figures the table shows. */
    readonly rows = signal<PopulationRow[]>([]);
    readonly sortedRows = computed(() => sortRows(this.rows(), this.sort(), cellOf));
    readonly expanded = signal<ReadonlySet<number>>(new Set());

    svg: d3.Selection<SVGGElement, unknown, null, undefined>;
    svgMargin = { top: 0, right: 0, bottom: 30, left: 0 };
    lineColors: d3.ScaleOrdinal<string, string> = null;

    graphHeight: number;
    graphWidth: number;
    /** The width of the chart's container when it was last drawn. */
    private measuredWidth = 0;
    zoom: d3.ZoomBehavior<SVGRectElement, unknown>;
    zoomRect: d3.Selection<SVGRectElement, unknown, null, undefined>;
    xExtent: [Date, Date];
    x: d3.ScaleTime<number, number>;

    queryParams: {
        [key: string]: string
    };

    schemeCategory20 = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5",
        "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"];

    constructor() {

        this.lineColors = d3.scaleOrdinal(this.schemeCategory20);
    }

    get hasStats(): boolean {
        return Object.keys(this.stats).length > 0;
    }

    /** Whether the servers picked differ from the ones on the chart. */
    get selectionChanged(): boolean {
        return this.hasStats && selectionDiffers(this.selectedWorlds, this.graphWorlds);
    }

    ngOnInit() {
        this.queryParams = definedParams({ startDate: this.startDate(), endDate: this.endDate(), worlds: this.worlds() });

        this.isLoading = true;

        effect(() => {
            const worlds = this.worldService.worlds();

            untracked(() => {
                if (worlds) {
                    this.availableWorlds = worlds;
                    this.setupFromQueryParams();
                }

                this.isLoading = false;
                this.cdr.markForCheck();
            });
        }, { injector: this.injector });

        this.redrawOnResize();
    }

    /** Draws the chart again, at the new size, when its container changes width (the sidebar loading, or the window resizing). */
    private redrawOnResize() {
        if (typeof ResizeObserver === 'undefined') {
            return;
        }

        const element = this.graphElement.nativeElement;
        const observer = new ResizeObserver(() => {
            if (this.hasStats && element.offsetWidth && Math.abs(element.offsetWidth - this.measuredWidth) > 1) {
                d3.select(element).selectAll('*').remove();
                this.renderGraph();
            }
        });
        observer.observe(element);
        this.destroyRef.onDestroy(() => observer.disconnect());
    }

    private createSvg() {
        const element = this.graphElement.nativeElement

        const svgHeight = element.offsetHeight;
        const svgWidth = element.offsetWidth;
        this.measuredWidth = svgWidth;
        this.graphWidth = element.offsetWidth - this.svgMargin.left - this.svgMargin.right;
        this.graphHeight = element.offsetHeight - this.svgMargin.top - this.svgMargin.bottom

        this.svg = d3.select(element)
            .append('svg:svg')
            .attr('viewBox', '0 0 ' + svgWidth + ' ' + svgHeight)
            .append("g")
            .attr("transform", "translate(" + this.svgMargin.left + "," + this.svgMargin.top + ")");

        this.svg.append('clipPath')
            .attr('id', 'clip')
            .append('rect')
            .attr('width', this.graphWidth)
            .attr('height', this.graphHeight);
    }

    isSelected(world: World): boolean {
        return this.selectedWorlds.includes(world);
    }

    /** The colour of the line a picked server will have, or `null` when it is not picked. */
    selectedColor(world: World): string | null {
        const index = this.selectedWorlds.indexOf(world);
        return index < 0 ? null : this.getLegendColor(index);
    }

    onToggleWorld(world: World) {
        if (this.isSelected(world)) {
            this.selectedWorlds = this.selectedWorlds.filter(selected => selected !== world);
        } else {
            this.selectedWorlds = [...this.selectedWorlds, world];
        }
        this.onSelectedWorldChange();
    }

    onSubmit() {
        this.errorMessage = '';
        this.isLoading = true;
        this.stats = {};
        this.graphWorlds = [];
        this.rows.set([]);
        d3.select(this.graphElement.nativeElement).selectAll('*').remove();

        const worldIds = this.selectedWorlds.map(a => a.id);

        this.worldRepository.getPopulationHistory(worldIds)
            .pipe(catchError(error => {
                this.errorMessage = getErrorMessage(error)
                this.cdr.markForCheck();
                return throwError(() => error);
            }))
            .pipe(finalize(() => {
                this.isLoading = false;
                this.cdr.markForCheck();
            }))
            .subscribe(data => {
                this.stats = data;
                this.graphWorlds = this.selectedWorlds.slice();
                this.rows.set(populationRows(this.graphWorlds, data, index => this.getLegendColor(index)));
                this.renderGraph();
                this.cdr.markForCheck();
            });
    }

    onZoom(zoomLevel: string) {
        this.activeRange.set(zoomLevel);
        let start: Date = new Date(this.xExtent[1]);
        let end: Date = new Date(this.xExtent[1]);

        switch (zoomLevel) {
            case '1m':
                start.setMonth(this.xExtent[1].getMonth() - 1);
                break;
            case '3m':
                start.setMonth(this.xExtent[1].getMonth() - 3);
                break;
            case '6m':
                start.setMonth(this.xExtent[1].getMonth() - 6);
                break;
            case 'ytd':
                start.setDate(1);
                start.setMonth(0);
                break;
            case '1y':
                start.setFullYear(this.xExtent[1].getFullYear() - 1);
                break;
            default:
                start = this.xExtent[0];
                end = this.xExtent[1];
                break;
        }

        this.zoomBetween(start, end);
    }

    onDateChange(_event?: unknown) {
        this.activeRange.set(null);
        const start = this.selectedStartDate.value;
        const end = this.selectedEndDate.value;
        this.zoomBetween(start, end);
    }

    onSort(sort: Sort) {
        this.sort.set(sort);
    }

    toggle(id: number): void {
        this.expanded.update(open => {
            const next = new Set(open);
            if (!next.delete(id)) {
                next.add(id);
            }
            return next;
        });
    }

    getLegendColor(index: number | string): string {
        return this.lineColors(String(index));
    }

    renderGraph() {
        // Measured now, once the chart has its place on the page, rather than when the component was created
        this.createSvg();

        const zoomed = (ev: d3.D3ZoomEvent<SVGRectElement, unknown>) => {
            if (ev.sourceEvent) {
                this.activeRange.set(null);
            }
            const xz = ev.transform.rescaleX(this.x);
            xGroup.call(xAxis.scale(xz)).select('.domain').remove();
            seriesGroup.selectAll('.line').attr('d', line.x((d) => {
                return xz(d.date);
            }));

            const domainXMin: Date = xAxis.scale<d3.AxisScale<Date>>().domain()[0];
            const domainXMax: Date = xAxis.scale<d3.AxisScale<Date>>().domain()[1];
            this.selectedStartDate.setValue(domainXMin);
            this.selectedEndDate.setValue(domainXMax);
        };

        const removeTooltip = () => {
            if (tooltip) tooltip.style('display', 'none');
            if (tooltipLine) tooltipLine.style('display', 'none');
        };

        const drawTooltip = (ev: MouseEvent) => {
            const tipElement: SVGRectElement = zoomRect.node() as SVGRectElement;
            const mousePos = d3.pointer(ev, tipElement);
            const dayMs = 1000 * 60 * 60 * 24;

            const zoomScale = d3.scaleTime().domain(xAxis.scale().domain()).range([0, this.graphWidth]);
            const postDate = Math.round(zoomScale.invert(mousePos[0]).getTime() / dayMs) * dayMs + dayMs;

            const matchingDate = new Date(postDate);
            matchingDate.setHours(0);

            tooltipLine
                .style('display', 'inline')
                .attr('x1', zoomScale(matchingDate))
                .attr('x2', zoomScale(matchingDate))
                .attr('y1', 0)
                .attr('y2', this.graphHeight);

            tooltip
                .html(matchingDate.toDateString())
                .style('display', 'block')
                .style('right', (this.graphWidth - mousePos[0] + 10) + 'px')
                .style('top', mousePos[1] - 20 + 'px')
                .selectAll()
                .data(series).enter()
                .append('div')
                .html((d, i) => {
                    const match = d.find(h => h.date.getTime() === matchingDate.getTime());
                    const matchValue = match ? dailyTotal(match) : 0;
                    const world = this.graphWorlds[i];
                    return '<span class="tooltip-swatch" style="background:' + this.lineColors(i.toString()) + '"></span>' +
                        escapeHtml(world.name || 'Server ' + world.id) + ': ' + (matchValue ? matchValue.toLocaleString() : '—');
                });
        };

        const series: DailyPopulation[][] = this.graphWorlds.map((): DailyPopulation[] => []);
        for (const k in this.stats) {
            const statId = parseInt(k);
            const idx = this.graphWorlds.findIndex(a => a.id === statId);
            if (idx < 0) {
                continue;
            }
            series[idx] = this.stats[statId].map((d): DailyPopulation => {
                const date = new Date(d.date);
                return {
                    date: new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
                    vsCount: d.vsCount,
                    ncCount: d.ncCount,
                    trCount: d.trCount,
                    nsCount: d.nsCount
                };
            });
        }

        this.xExtent = d3.extent(series.flat(), (d) => { return new Date(d.date); }) as [Date, Date];

        if (!this.xExtent[0]) {
            return;
        }

        if (!this.selectedStartDate.value) {
            this.selectedStartDate.setValue(this.xExtent[0]);
        }
        if (!this.selectedEndDate.value) {
            this.selectedEndDate.setValue(this.xExtent[1]);
        }

        this.x = d3.scaleTime()
            .domain(this.xExtent)
            .range([0, this.graphWidth]);

        const maxY = d3.max(series, (s) => { return d3.max(s, dailyTotal) }) || 0;

        const y = d3.scaleLinear()
            .domain([0, maxY])
            .rangeRound([this.graphHeight, 0]);

        const line = d3.line<DailyPopulation>()
            .defined((d) => { return dailyTotal(d) > 0; })
            .x((d) => { return this.x(d.date); })
            .y((d) => { return y(dailyTotal(d)); });

        this.zoom = d3.zoom<SVGRectElement, unknown>()
            .scaleExtent([1, 32])
            .translateExtent([[-this.graphWidth, -Infinity], [2 * this.graphWidth, Infinity]])
            .on('zoom', zoomed)
            .on('end', () => {
                this.setQueryParam("startDate", this.selectedStartDate.value);
                this.setQueryParam("endDate", this.selectedEndDate.value);
            });

        const zoomRect = this.svg.append('rect')
            .attr('width', this.graphWidth)
            .attr('height', this.graphHeight)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('mousemove', drawTooltip)
            .on('mouseout', removeTooltip);

        this.zoomRect = zoomRect.call(this.zoom);

        const xAxis = d3.axisBottom(this.x)
            .tickFormat(d3.timeFormat('%e. %b'));
        const xGroup = this.svg.append('g')
            .attr('transform', 'translate(0,' + this.graphHeight + ')');
        xGroup.call(xAxis);
        xGroup.select('.domain').remove();

        const yAxis = d3.axisRight(y)
            .ticks(6)
            .tickSize(this.graphWidth);
        const yGroup = this.svg.append("g");
        yGroup.call(yAxis);
        yGroup.select('.domain').remove();
        yGroup.selectAll('text')
            .attr('x', this.graphWidth)
            .attr('dy', -4)
            .attr('text-anchor', 'end');

        const seriesGroup = this.svg.append('g');
        seriesGroup.selectAll('.line')
            .data(series)
            .enter()
            .append('path')
            .attr('clip-path', 'url(#clip)')
            .attr('fill', 'none')
            .attr('class', 'line')
            .attr('stroke', (d, i) => this.lineColors(i.toString()))
            .attr('d', line);

        const tooltip = d3.select('#tooltip');
        const tooltipLine = this.svg.append('line').attr('class', 'tooltip-line');

        this.zoom.translateExtent([[this.x(this.xExtent[0]), -Infinity], [this.x(this.xExtent[1]), Infinity]]);

        this.zoomBetween(this.selectedStartDate.value, this.selectedEndDate.value);

    }

    private setupFromQueryParams() {
        if (this.queryParams['startDate']) {
            const startDate = new Date(this.queryParams['startDate']);
            this.selectedStartDate.setValue(startDate);
        }

        if (this.queryParams['endDate']) {
            const endDate = new Date(this.queryParams['endDate']);
            this.selectedEndDate.setValue(endDate);
        }

        if (this.queryParams['worlds']) {
            const worldIds = this.queryParams['worlds'].split(',').map(a => parseInt(a));
            worldIds.forEach(worldId => {
                const world = this.availableWorlds.find(a => a.id === worldId);
                if (world && !this.selectedWorlds.includes(world)) {
                    this.selectedWorlds.push(world);
                }
            });

            if (this.selectedWorlds.length) {
                this.onSubmit();
            }
        }
    }

    private onSelectedWorldChange() {
        this.setQueryParam("worlds", this.selectedWorlds.map(a => a.id));
    }

    private zoomBetween(start: Date, end: Date) {
        const zoomScale = this.graphWidth / (this.x(end) - this.x(start));
        const zoomTranslate = -this.x(start);
        this.zoomRect.call(this.zoom.transform, d3.zoomIdentity.scale(zoomScale).translate(zoomTranslate, 0));

        this.setQueryParam("startDate", start);
        this.setQueryParam("endDate", end);
    }

    private setQueryParam(key: string, value: string | number[] | Date | null) {
        let sVal: string;

        if (value instanceof Array) {
            sVal = value.join(',');
        } else if (value instanceof Date) {
            sVal = this.toDateString(value);
        } else {
            sVal = value as string;
        }

        this.queryParams[key] = sVal;

        this.router.navigate([], { queryParams: this.queryParams, queryParamsHandling: 'merge', replaceUrl: true });
    }

    private toDateString(d: Date): string {
        return d.getUTCFullYear() + "-" + ("0" + (d.getUTCMonth() + 1)).slice(-2) + "-" + ("0" + d.getUTCDate()).slice(-2);
    }
}

interface DailyPopulation {
    date: Date;
    vsCount: number;
    ncCount: number;
    trCount: number;
    nsCount: number;
}
