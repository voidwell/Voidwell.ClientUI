import { Component, OnInit, ElementRef, ViewChild, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, startWith, map, tap } from 'rxjs/operators';
import * as d3 from 'd3';
import { OracleRepository } from '@core/api/ps2/oracle.repository';
import { OracleStatsByWeapon, SimpleItem } from '@core/api/models/ps2/weapon.model';
import { MatSelectChange, MatSelect, MatOption } from '@angular/material/select';
import { getErrorMessage } from '@core/util/error-message';
import { definedParams } from '@shared/utils/query-params';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatChipGrid, MatChipRow, MatChipRemove, MatChipInput } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { AsyncPipe } from '@angular/common';

const statOptions = [
    { id: 'kills', display: 'Kills' },
    { id: 'uniques', display: 'Uniques' },
    { id: 'kpu', display: 'KPU' },
    { id: 'vkpu', display: 'Vehicle KPU' },
    { id: 'akpu', display: 'Aircraft KPU' },
    { id: 'kph', display: 'KPH' },
    { id: 'vkph', display: 'Vehicle KPH' },
    { id: 'akph', display: 'Aircraft KPH' },
    { id: 'avg-br', display: 'Average BR' },
    { id: 'hkills', display: 'Headshot Kills' },
    { id: 'headshot-percent', display: 'Headshot %' },
    { id: 'q4-kills', display: 'Q4 Kills' },
    { id: 'q4-uniques', display: 'Q4 Uniques' },
    { id: 'q4-kpu', display: 'Q4 KPU' },
    { id: 'q4-headshots', display: 'Q4 Headshot Kills' },
    { id: 'q4-headshots-percent', display: 'Q4 Headshot %' },
    { id: 'q1-kpu', display: 'Q1 KPU' },
    { id: 'q2-kpu', display: 'Q2 KPU' },
    { id: 'q3-kpu', display: 'Q3 KPU' }
];

const categoryOptions = [
    { id: 'all', display: 'Choose From All Weapons' },
    { id: 'melee', display: 'Melee' },
    { id: 'sidearms', display: 'Sidearms' },
    { id: 'shotguns', display: 'Shotguns' },
    { id: 'smg', display: 'SMG' },
    { id: 'lmg', display: 'LMG' },
    { id: 'assault-rifles', display: 'Assault Rifles' },
    { id: 'carbines', display: 'Carbines' },
    { id: 'sniper-rifles', display: 'Sniper Rifles' },
    { id: 'scout-rifles', display: 'Scout Rifles' },
    { id: 'battle-rifles', display: 'Battle Rifles' },
    { id: 'rocket-launchers', display: 'Rocket Launchers' },
    { id: 'es-heavy-gun', display: 'ES Heavy Gun' },
    { id: 'av-max', display: 'AV Max' },
    { id: 'ai-max', display: 'AI Max' },
    { id: 'aa-max', display: 'AA Max' },
    { id: 'grenades', display: 'Grenades' },
    { id: 'explosives', display: 'Explosives' },
    { id: 'harasser', display: 'Harasser Weapons' },
    { id: 'liberator', display: 'Liberator Weapons' },
    { id: 'lightning', display: 'Lightning Weapons' },
    { id: 'mbt-primary', display: 'MBT Primary Weapons' },
    { id: 'mbt-secondary', display: 'MBT Secondary Weapons' },
    { id: 'esf', display: 'ESF Weapons' },
    { id: 'turrets', display: 'Turrets' },
    { id: 'flash', display: 'Flash Weapons' },
    { id: 'sunderer', display: 'Sunderer Weapons' },
    { id: 'sunderer', display: 'Sunderer Weapons' },
    { id: 'galaxy', display: 'Galaxy Weapons' },
    { id: 'valkyrie', display: 'Valkyrie Weapons' },
    { id: 'ant', display: 'ANT Weapons' }
];

@Component({
    templateUrl: './weapon-tracker.component.html',
    styleUrls: ['./weapon-tracker.component.css'],
    imports: [MatCard, MatCardContent, MatFormField, MatSelect, FormsModule, ReactiveFormsModule, MatOption, MatChipGrid, MatChipRow, MatIcon, MatChipRemove, MatAutocompleteTrigger, MatChipInput, MatAutocomplete, MatButton, LoaderComponent, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, AsyncPipe]
})

export class WeaponTrackerComponent implements OnInit {
    readonly stat = input<string>();
    readonly category = input<string>();
    readonly startDate = input<string>();
    readonly endDate = input<string>();
    readonly weapons = input<string>();
    private router = inject(Router);
    private oracleRepository = inject(OracleRepository);

    @ViewChild('linegraph', { static: true }) graphElement: ElementRef<HTMLElement>;
    @ViewChild('weaponInput') weaponInput: ElementRef<HTMLInputElement>;
    @ViewChild(MatAutocompleteTrigger) autoTrigger: MatAutocompleteTrigger;

    isLoading: boolean;
    errorMessage: string = null;

    statOptions = statOptions;
    categoryOptions = categoryOptions;

    selectedStat = new FormControl('kills');
    selectedCategory = new FormControl();
    selectedWeaponControl = new FormControl();
    selectedStartDate = new FormControl();
    selectedEndDate = new FormControl();

    filteredWeapons: Observable<SimpleItem[]>;

    availableWeapons: SimpleItem[] = [];
    stats: OracleStatsByWeapon = {};
    selectedWeapons: SimpleItem[] = [];
    graphWeapons: SimpleItem[] = [];

    svg: d3.Selection<SVGGElement, unknown, null, undefined>;
    svgMargin = { top: 0, right: 0, bottom: 30, left: 0 };
    lineColors: d3.ScaleOrdinal<string, string> = null;

    graphHeight: number;
    graphWidth: number;
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

        this.filteredWeapons = this.selectedWeaponControl.valueChanges.pipe(
            startWith(null), map((weapon: string | null) => weapon ? this._filterSearch(weapon) : this._filterUnselected()));
    }

    get hasStats(): boolean {
        return Object.keys(this.stats).length > 0;
    }

    ngOnInit() {
        this.queryParams = definedParams({
            stat: this.stat(), category: this.category(), startDate: this.startDate(), endDate: this.endDate(), weapons: this.weapons()
        });

        this.createSvg();

        this.setupFromQueryParams();
    }

    private createSvg() {
        const element = this.graphElement.nativeElement;

        const svgHeight = element.offsetHeight;
        const svgWidth = element.offsetWidth;
        this.graphWidth = element.offsetWidth - this.svgMargin.left - this.svgMargin.right;
        this.graphHeight = element.offsetHeight - this.svgMargin.top - this.svgMargin.bottom

        this.svg= d3.select(element)
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

    onStatChange(event: MatSelectChange) {
        this.setQueryParam("stat", event.value);
        this.setStat(event.value);
    }

    onCategoryChange(event: MatSelectChange) {
        this.setQueryParam("category", event.value);
        this.setCategory(event.value).subscribe();
    }

    onWeaponSelected(event: MatAutocompleteSelectedEvent) {
        this.selectedWeapons.push(event.option.value);
        this.selectedWeaponControl.setValue(null);
        this.selectedWeaponControl.setValue(this.weaponInput.nativeElement.value);
        this.onSelectedWeaponChange();

        setTimeout(() => {
            this.autoTrigger.openPanel();
        }, 1);
    }

    onRemoveSelectedWeapon(weapon: SimpleItem) {
        const idx = this.selectedWeapons.indexOf(weapon);
        this.selectedWeapons.splice(idx, 1);
        this.onSelectedWeaponChange();

        this.selectedWeaponControl.setValue(null);
        this.selectedWeaponControl.setValue(this.weaponInput.nativeElement.value);
    }

    onSubmit() {
        this.errorMessage = '';
        this.isLoading = true;
        this.stats = {};
        this.graphWeapons = [];
        this.svg.selectAll('*').remove();

        const statId = this.selectedStat.value;

        const weaponIds = this.selectedWeapons.map(a => a.id);

        this.oracleRepository.getStats(statId, weaponIds)
            .pipe(catchError(error => {
                this.errorMessage = getErrorMessage(error)
                return throwError(() => error);
            }))
            .pipe(finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(data => {
                this.stats = data;
                this.graphWeapons = this.selectedWeapons.slice();
                this.renderGraph();
            });
    }

    onZoom(zoomLevel: string) {
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
        const start = this.selectedStartDate.value;
        const end = this.selectedEndDate.value;
        this.zoomBetween(start, end);
    }

    getLegendColor(index: number | string): string {
        return this.lineColors(String(index));
    }

    renderGraph() {
        const zoomed = (ev: d3.D3ZoomEvent<SVGRectElement, unknown>) => {
            const xz = ev.transform.rescaleX(this.x);
            xGroup.call(xAxis.scale(xz)).select('.domain').remove();
            seriesGroup.selectAll('.line').attr('d', line.x((d) => {
                return xz(d.period);
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

            const zoomScale = d3.scaleTime().domain(xAxis.scale().domain()).range([0, this.graphWidth]);;
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
                .style('color', (d, i) => this.lineColors(i.toString()))
                .html((d, i) => {
                    const match = d.find(h => h.period.getTime() === matchingDate.getTime());
                    const matchValue = match ? match.value : 0;
                    return this.graphWeapons[i].id + ' - ' + this.graphWeapons[i].name + ': ' + (matchValue ? matchValue.toLocaleString() : '-');
                });
        };

        const series: OracleStat[][] = [...Array(this.graphWeapons.length)];
        for (const k in this.stats) {
            const statId = parseInt(k);
            const idx = this.graphWeapons.findIndex(a => a.id === statId);
            const stats = this.stats[statId].map((d):  OracleStat => {
                const date = new Date(d.period);
                return {
                    period: new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
                    value: d.value
                };
            });
            series[idx] = stats;
        }

        this.xExtent = d3.extent(series[0], (d) => { return new Date(d.period); }) as [Date, Date];

        if (!this.selectedStartDate.value) {
            this.selectedStartDate.setValue(this.xExtent[0]);
        }
        if (!this.selectedEndDate.value) {
            this.selectedEndDate.setValue(this.xExtent[1]);
        }

        this.x = d3.scaleTime()
            .domain(this.xExtent)
            .range([0, this.graphWidth]);

        const maxY = d3.max(series, (s) => { return d3.max(s, (d) => { return d.value; }) });

        const y = d3.scaleLinear()
            .domain([0, maxY])
            .rangeRound([this.graphHeight, 0]);

        const line = d3.line<OracleStat>()
            .defined((d) => { return !!d.value; })
            .x((d) => { return this.x(d.period); })
            .y((d) => { return y(d.value); });

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
        if (this.queryParams['stat']) {
            this.setStat(this.queryParams['stat']);
        } else {
            this.setQueryParam('stat', 'kills');
        }

        if (this.queryParams['category']) {
            this.setCategory(this.queryParams['category'])
                .subscribe(() => {
                    if (this.queryParams['startDate']) {
                        const startDate = new Date(this.queryParams['startDate']);
                        this.selectedStartDate.setValue(startDate);
                    }

                    if (this.queryParams['endDate']) {
                        const endDate = new Date(this.queryParams['endDate']);
                        this.selectedEndDate.setValue(endDate);
                    }

                    if (this.queryParams['weapons']) {
                        const weaponIds = this.queryParams['weapons'].split(',').map(a => parseInt(a));
                        weaponIds.forEach(weaponId => {
                            const weapon = this.availableWeapons.find(a => a.id === weaponId);
                            if (weapon) {
                                this.selectedWeapons.push(weapon);
                            }
                        });

                        this.onSubmit();
                    }
                });
        }
    }

    private setStat(stat: string) {
        if (this.selectedStat.value !== stat) {
            this.selectedStat.setValue(stat);
        }
    }

    private setCategory(category: string): Observable<SimpleItem[]> {
        this.errorMessage = '';
        this.isLoading = true;
        this.availableWeapons = [];

        if (this.selectedCategory.value !== category) {
            this.selectedCategory.setValue(category);
        }

        return this.oracleRepository.getCategoryWeapons(category)
            .pipe(
                catchError(error => {
                    this.errorMessage = getErrorMessage(error)
                    return throwError(() => error);
                }),
                tap(weapons => {
                    this.availableWeapons = weapons;
                }),
                finalize(() => {
                    this.isLoading = false;
                }));
    }

    private onSelectedWeaponChange() {
        this.setQueryParam("weapons", this.selectedWeapons.map(a => a.id));
    }

    private zoomBetween(start: Date, end: Date) {
        const zoomScale = this.graphWidth / (this.x(end) - this.x(start));
        const zoomTranslate = -this.x(start);
        this.zoomRect.call(this.zoom.transform, d3.zoomIdentity.scale(zoomScale).translate(zoomTranslate, 0));

        this.setQueryParam("startDate", start);
        this.setQueryParam("endDate", end);
    }

    private _filterUnselected(): SimpleItem[] {
        return this.availableWeapons.filter(weapon => this.selectedWeapons.indexOf(weapon) === -1);
    }

    private _filterSearch(value: string): SimpleItem[] {
        if (typeof value !== 'string') {
            return this._filterUnselected();
        }

        const filterValue = value.toLowerCase();
        return this._filterUnselected().filter(weapon => weapon.name && weapon.name.toLowerCase().indexOf(filterValue) > -1);
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

        this.router.navigate([], { queryParams: this.queryParams, replaceUrl: true });
    }

    private toDateString(d: Date): string {
        return d.getUTCFullYear() + "-" + ("0" + (d.getUTCMonth() + 1)).slice(-2) + "-" + ("0" + d.getUTCDate()).slice(-2);
    }
}

interface OracleStat {
    period: Date;
    value: number;
}