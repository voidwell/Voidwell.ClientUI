import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { D3Service, D3, Selection, BaseType, ZoomBehavior, ScaleTime } from 'd3-ng2-service';
import { PlanetsideApi } from './../planetside-api.service';

@Component({
    templateUrl: './weapon-tracker.template.html',
    styleUrls: ['./weapon-tracker.styles.css']
})

export class WeaponTrackerComponent implements OnInit {
    @ViewChild('linegraph') graphElement: ElementRef;

    isLoading: boolean;
    errorMessage: string = null;
    lineColors = ['#de3535', '#359ade', '#6c35de'];

    statOptions = [
        { id: 'kills', display: 'Kills' },
        { id: 'uniques', display: 'Uniques' },
        { id: 'kpu', display: 'KPU' },
        //{ id: 'vkpu', display: 'Vehicle KPU' },
        //{ id: 'akpu', display: 'Aircraft KPU' },
        //{ id: 'kph', display: 'KPH' },
        //{ id: 'vkph', display: 'Vehicle KPH' },
        //{ id: 'akph', display: 'Aircraft KPH' },
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

    categoryOptions = [
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

    selectedStat = new FormControl('kills');
    selectedCategory = new FormControl();
    selectedWeapon1 = new FormControl();
    selectedWeapon2 = new FormControl();
    selectedWeapon3 = new FormControl();
    selectedStartDate = new FormControl();
    selectedEndDate = new FormControl();

    weapons: any[] = [];
    stats: any[] = [];

    svg: Selection<BaseType, {}, HTMLElement, any>;
    d3: D3;
    svgMargin = { top: 0, right: 0, bottom: 30, left: 0 };

    graphHeight: any;
    graphWidth: any;
    zoom: ZoomBehavior<Element, {}>;
    zoomRect: Selection<BaseType, {}, HTMLElement, any>;
    xExtent: [Date, Date];
    x: ScaleTime<number, number>;

    constructor(private api: PlanetsideApi, element: ElementRef, d3Service: D3Service) {
        this.d3 = d3Service.getD3();
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
    }

    onCategoryChange(event) {
        this.errorMessage = '';
        this.isLoading = true;
        this.weapons = [];

        this.api.getOracleWeapons(event.value)
            .pipe<any>(catchError(error => {
                this.errorMessage = error._body || error.statusText
                return throwError(error);
            }))
            .pipe<any>(finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(data => {
                this.weapons = data;
            });
    }

    onSubmit() {
        this.errorMessage = '';
        this.isLoading = true;
        this.stats = [];
        this.svg.selectAll('*').remove();

        let statId = this.selectedStat.value;

        let weaponIds = [];
        if (this.selectedWeapon1.value) {
            weaponIds.push(this.selectedWeapon1.value);
        }
        if (this.selectedWeapon2.value) {
            weaponIds.push(this.selectedWeapon2.value);
        }
        if (this.selectedWeapon3.value) {
            weaponIds.push(this.selectedWeapon3.value);
        }

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

        this.selectedStartDate.setValue(start);
        this.selectedEndDate.setValue(end);
        this.zoomBetween(start, end);
    }

    onDateChange(event) {
        let start = this.selectedStartDate.value;
        let end = this.selectedEndDate.value;
        this.zoomBetween(start, end);
    }

    renderGraph() {
        let d3 = this.d3;
        let self = this;

        let data1: any[] = this.stats[this.selectedWeapon1.value];
        let data2: any[] = this.stats[this.selectedWeapon2.value];
        let data3: any[] = this.stats[this.selectedWeapon3.value];

        let series: OracleStat[][] = [];
        for (let k in this.stats) {
            let stats = this.stats[k].map(function (d) {
                return {
                    period: new Date(d.period),
                    value: d.value
                };
            });
            series.push(stats);
        }

        this.xExtent = d3.extent(data1, function (d) { return new Date(d.period); });

        this.selectedStartDate.setValue(this.xExtent[0]);
        this.selectedEndDate.setValue(this.xExtent[1]);

        this.x = d3.scaleTime()
            .domain(this.xExtent)
            .range([0, this.graphWidth]);

        let maxY = d3.max(series, function (s) { return d3.max(s, function (d) { return d.value; }) });

        let y = d3.scaleLinear()
            .domain([0, maxY])
            .rangeRound([this.graphHeight, 0]);

        let line = d3.line<any>()
            .defined(function(d) { return d.value; })
            .y(function(d) { return y(d.value); });

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
            .attr('stroke', (d, i) => this.lineColors[i])
            .attr('d', line);

        this.zoom = this.d3.zoom()
            .scaleExtent([1, 32])
            .translateExtent([[-this.graphWidth, -Infinity], [2 * this.graphWidth, Infinity]])
            .on('zoom', zoomed);

        this.zoomRect = this.svg.append('rect')
            .attr('width', this.graphWidth)
            .attr('height', this.graphHeight)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')
            .call(this.zoom);

        this.zoom.translateExtent([[this.x(this.xExtent[0]), -Infinity], [this.x(this.xExtent[1]), Infinity]]);

        this.zoomBetween(this.xExtent[0], this.xExtent[1]);

        function zoomed() {
            let xz = d3.event.transform.rescaleX(self.x);
            xGroup.call(xAxis.scale(xz)).select('.domain').remove();
            seriesGroup.selectAll('.line').attr('d', line.x(function (d) {
                return xz(d.period);
            }));
        }
    }

    private zoomBetween(start: Date, end: Date) {
        let zoomScale = this.graphWidth / (this.x(end) - this.x(start));
        let zoomTranslate = -this.x(start);
        this.zoomRect.call(this.zoom.transform, this.d3.zoomIdentity.scale(zoomScale).translate(zoomTranslate, 0));
    }
}

interface OracleStat {
    period: Date;
    value: number;
}