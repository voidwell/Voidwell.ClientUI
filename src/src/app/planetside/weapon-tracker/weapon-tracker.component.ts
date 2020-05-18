import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, startWith, map, tap } from 'rxjs/operators';
import { D3Service, D3, Selection, BaseType, ZoomBehavior, ScaleTime, AxisScale, ScaleOrdinal } from 'd3-ng2-service';
import { PlanetsideApi } from './../shared/services/planetside-api.service';

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
    templateUrl: './weapon-tracker.template.html',
    styleUrls: ['./weapon-tracker.styles.css']
})

export class WeaponTrackerComponent implements OnInit {
    @ViewChild('linegraph') graphElement: ElementRef;
    @ViewChild('weaponInput') weaponInput: ElementRef;
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

    filteredWeapons: Observable<any[]>;

    weapons: any[] = [];
    stats: any[] = [];
    selectedWeapons: any[] = [];
    graphWeapons: any[] = [];

    svg: Selection<BaseType, {}, HTMLElement, any>;
    d3: D3;
    svgMargin = { top: 0, right: 0, bottom: 30, left: 0 };
    lineColors: ScaleOrdinal<string, string> = null;

    graphHeight: any;
    graphWidth: any;
    zoom: ZoomBehavior<SVGRectElement, {}>;
    zoomRect: Selection<BaseType, {}, HTMLElement, any>;
    xExtent: [Date, Date];
    x: ScaleTime<number, number>;

    queryParams: {
        [key: string]: any
    };

    schemeCategory20 = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5",
        "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"];

    constructor(private activatedRoute: ActivatedRoute, private router: Router, private api: PlanetsideApi, element: ElementRef, d3Service: D3Service) {
        this.queryParams = Object.assign({}, activatedRoute.snapshot.queryParams);

        this.d3 = d3Service.getD3();
        this.lineColors = this.d3.scaleOrdinal(this.schemeCategory20);

        this.filteredWeapons = this.selectedWeaponControl.valueChanges.pipe(
            startWith(null), map((weapon: string | null) => weapon ? this._filterSearch(weapon) : this._filterUnselected()));
    }

    ngOnInit() {
        let element = this.graphElement.nativeElement;

        let svgHeight = element.offsetHeight;
        let svgWidth = element.offsetWidth;
        this.graphWidth = element.offsetWidth - this.svgMargin.left - this.svgMargin.right;
        this.graphHeight = element.offsetHeight - this.svgMargin.top - this.svgMargin.bottom

        this.svg= this.d3.select(element)
            .append('svg:svg')
            .attr('viewBox', '0 0 ' + svgWidth + ' ' + svgHeight)
            .append("g")
            .attr("transform", "translate(" + this.svgMargin.left + "," + this.svgMargin.top + ")");

        this.svg.append('clipPath')
            .attr('id', 'clip')
            .append('rect')
            .attr('width', this.graphWidth)
            .attr('height', this.graphHeight);

        this.setupFromQueryParams();
    }

    onStatChange(event) {
        this.setQueryParam("stat", event.value);
        this.setStat(event.value);
    }

    onCategoryChange(event) {
        this.setQueryParam("category", event.value);
        this.setCategory(event.value).subscribe();
    }

    onWeaponSelected(event: MatAutocompleteSelectedEvent) {
        this.selectedWeapons.push(event.option.value);
        this.selectedWeaponControl.setValue(null);
        this.selectedWeaponControl.setValue(this.weaponInput.nativeElement.value);
        this.onSelectedWeaponChange();

        const self = this;
        setTimeout(function () {
            self.autoTrigger.openPanel();
        }, 1);
    }

    onRemoveSelectedWeapon(weapon) {
        let idx = this.selectedWeapons.indexOf(weapon);
        this.selectedWeapons.splice(idx, 1);
        this.onSelectedWeaponChange();

        this.selectedWeaponControl.setValue(null);
        this.selectedWeaponControl.setValue(this.weaponInput.nativeElement.value);
    }

    onSubmit() {
        this.errorMessage = '';
        this.isLoading = true;
        this.stats = [];
        this.graphWeapons = [];
        this.svg.selectAll('*').remove();

        let statId = this.selectedStat.value;

        let weaponIds = this.selectedWeapons.map(a => a.id);

        this.api.getOracleData(statId, weaponIds)
            .pipe<any>(catchError(error => {
                this.errorMessage = error._body || error.statusText
                return throwError(error);
            }))
            .pipe<any>(finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(data => {
                this.stats = data;
                this.graphWeapons = this.selectedWeapons.slice();
                this.renderGraph();
            });
    }

    onZoom(zoomLevel) {
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

    onDateChange(event) {
        let start = this.selectedStartDate.value;
        let end = this.selectedEndDate.value;
        this.zoomBetween(start, end);
    }

    getLegendColor(index: string): string {
        return this.lineColors(index);
    }

    renderGraph() {
        let d3 = this.d3;
        let self = this;

        let series: OracleStat[][] = [...Array(this.graphWeapons.length)];
        for (let k in this.stats) {
            let statId = parseInt(k);
            let idx = this.graphWeapons.findIndex(a => a.id == statId);
            let stats = this.stats[k].map(function (d) {
                let date = new Date(d.period);
                return {
                    period: new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
                    value: d.value
                };
            });
            series[idx] = stats;
        }

        this.xExtent = d3.extent(series[0], function (d) { return new Date(d.period); });

        if (!this.selectedStartDate.value) {
            this.selectedStartDate.setValue(this.xExtent[0]);
        }
        if (!this.selectedEndDate.value) {
            this.selectedEndDate.setValue(this.xExtent[1]);
        }

        this.x = d3.scaleTime()
            .domain(this.xExtent)
            .range([0, this.graphWidth]);

        let maxY = d3.max(series, function (s) { return d3.max(s, function (d) { return d.value; }) });

        let y = d3.scaleLinear()
            .domain([0, maxY])
            .rangeRound([this.graphHeight, 0]);

        let line = d3.line<any>()
            .defined(function (d) { return d.value; })
            .x(function (d) { return self.x(d.period); })
            .y(function (d) { return y(d.value); });

        this.zoom = this.d3.zoom<SVGRectElement, {}>()
            .scaleExtent([1, 32])
            .translateExtent([[-this.graphWidth, -Infinity], [2 * this.graphWidth, Infinity]])
            .on('zoom', zoomed)
            .on('end', function () {
                self.setQueryParam("startDate", self.selectedStartDate.value);
                self.setQueryParam("endDate", self.selectedEndDate.value);
            });

        let zoomRect = this.svg.append('rect')
            .attr('width', this.graphWidth)
            .attr('height', this.graphHeight)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .on('mousemove', drawTooltip)
            .on('mouseout', removeTooltip);

        this.zoomRect = zoomRect.call(this.zoom);
            

        let xAxis = d3.axisBottom(this.x)
            .tickFormat(d3.timeFormat('%e. %b'));
        let xGroup = this.svg.append('g')
            .attr('transform', 'translate(0,' + this.graphHeight + ')');
        xGroup.call(xAxis);
        xGroup.select('.domain').remove();

        let yAxis = d3.axisRight(y)
            .tickSize(this.graphWidth);
        let yGroup = this.svg.append("g");
        yGroup.call(yAxis);
        yGroup.select('.domain').remove();
        yGroup.selectAll('text')
            .attr('x', this.graphWidth)
            .attr('dy', -4)
            .attr('text-anchor', 'end');

        let seriesGroup = this.svg.append('g');
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

        function zoomed() {
            let xz = d3.event.transform.rescaleX(self.x);
            xGroup.call(xAxis.scale(xz)).select('.domain').remove();
            seriesGroup.selectAll('.line').attr('d', line.x(function (d) {
                return xz(d.period);
            }));

            let domainXMin: Date = xAxis.scale<AxisScale<Date>>().domain()[0];
            let domainXMax: Date = xAxis.scale<AxisScale<Date>>().domain()[1];
            self.selectedStartDate.setValue(domainXMin);
            self.selectedEndDate.setValue(domainXMax);
        }

        function removeTooltip() {
            if (tooltip) tooltip.style('display', 'none');
            if (tooltipLine) tooltipLine.style('display', 'none');
        }

        function drawTooltip() {
            let tipElement: SVGRectElement = zoomRect.node() as SVGRectElement;
            let mousePos = d3.mouse(tipElement);
            let dayMs = 1000 * 60 * 60 * 24;

            let zoomScale = d3.scaleTime().domain(xAxis.scale().domain()).range([0, self.graphWidth]);;
            let postDate = Math.round(zoomScale.invert(mousePos[0]).getTime() / dayMs) * dayMs + dayMs;

            let matchingDate = new Date(postDate);
            matchingDate.setHours(0);

            tooltipLine
                .style('display', 'inline')
                .attr('x1', zoomScale(matchingDate))
                .attr('x2', zoomScale(matchingDate))
                .attr('y1', 0)
                .attr('y2', self.graphHeight);

            tooltip
                .html(matchingDate.toDateString())
                .style('display', 'block')
                .style('right', (self.graphWidth - mousePos[0] + 10) + 'px')
                .style('top', mousePos[1] - 20 + 'px')
                .selectAll()
                .data(series).enter()
                .append('div')
                .style('color', (d, i) => self.lineColors(i.toString()))
                .html((d, i) => {
                    let match = d.find(h => h.period.getTime() === matchingDate.getTime());
                    let matchValue = match ? match.value : 0;
                    return self.graphWeapons[i].id + ' - ' + self.graphWeapons[i].name + ': ' + (matchValue ? matchValue.toLocaleString() : '-');
                });
        }
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
                        let startDate = new Date(this.queryParams['startDate']);
                        this.selectedStartDate.setValue(startDate);
                    }

                    if (this.queryParams['endDate']) {
                        let endDate = new Date(this.queryParams['endDate']);
                        this.selectedEndDate.setValue(endDate);
                    }

                    if (this.queryParams['weapons']) {
                        let weaponIds = this.queryParams['weapons'].split(',').map(a => parseInt(a));
                        weaponIds.forEach(weaponId => {
                            let weapon = this.weapons.find(a => a.id === weaponId);
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

    private setCategory(category: string): Observable<any> {
        this.errorMessage = '';
        this.isLoading = true;
        this.weapons = [];

        if (this.selectedCategory.value !== category) {
            this.selectedCategory.setValue(category);
        }

        return this.api.getOracleWeapons(category)
            .pipe<any, any, any>(
                catchError(error => {
                    this.errorMessage = error._body || error.statusText
                    return throwError(error);
                }),
                tap(weapons => {
                    this.weapons = weapons;
                }),
                finalize(() => {
                    this.isLoading = false;
                }));
    }

    private onSelectedWeaponChange() {
        this.setQueryParam("weapons", this.selectedWeapons.map(a => a.id));
    }

    private setSelectedWeapons(weaponIds: any[]) {
        for (let id in weaponIds) {
            let weapon = this.weapons.find(a => a.id === id);
            if (weapon) {
                this.selectedWeapons.push(weapon);
            }
        }
    }

    private zoomBetween(start: Date, end: Date) {
        let zoomScale = this.graphWidth / (this.x(end) - this.x(start));
        let zoomTranslate = -this.x(start);
        this.zoomRect.call(this.zoom.transform, this.d3.zoomIdentity.scale(zoomScale).translate(zoomTranslate, 0));

        this.setQueryParam("startDate", start);
        this.setQueryParam("endDate", end);
    }

    private _filterUnselected(): any[] {
        return this.weapons.filter(weapon => this.selectedWeapons.indexOf(weapon) === -1);
    }

    private _filterSearch(value: string): any[] {
        if (typeof value !== 'string') {
            return this._filterUnselected();
        }

        const filterValue = value.toLowerCase();
        return this._filterUnselected().filter(weapon => weapon.name && weapon.name.toLowerCase().indexOf(filterValue) > -1);
    }

    private setQueryParam(key: string, value: any) {
        let sVal: string;

        if (value instanceof Array) {
            sVal = value.join(',');
        } else if (value instanceof Date) {
            sVal = this.toDateString(value);
        } else {
            sVal = value;
        }

        this.queryParams[key] = sVal;

        this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: this.queryParams, replaceUrl: true });
    }

    private toDateString(d: Date): string {
        return d.getUTCFullYear() + "-" + ("0" + (d.getUTCMonth() + 1)).slice(-2) + "-" + ("0" + d.getUTCDate()).slice(-2);
    }
}

interface OracleStat {
    period: Date;
    value: number;
}