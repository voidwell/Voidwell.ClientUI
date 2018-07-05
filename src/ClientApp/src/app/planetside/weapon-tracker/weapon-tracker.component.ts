import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { D3Service, D3 } from 'd3-ng2-service';
import { PlanetsideApi } from './../planetside-api.service';

@Component({
    templateUrl: './weapon-tracker.template.html',
    styleUrls: ['./weapon-tracker.styles.css']
})

export class WeaponTrackerComponent implements OnInit {
    @ViewChild('linegraph') graphElement: ElementRef;

    isLoading: boolean;
    errorMessage: string = null;
    d3: D3;

    statOptions = [
        { id: 'kills', display: 'Kills' },
        { id: 'uniques', display: 'Uniques' },
        { id: 'kpu', display: 'KPU' },
        { id: 'vkpu', display: 'Vehicle KPU' },
        { id: 'akpu', display: 'Aircraft KPU' },
        { id: 'kph', display: 'KPH' },
        { id: 'vkph', display: 'Vehicle KPH' },
        { id: 'akph', display: 'Aircraft KPH' },
        { id: 'hkills', display: 'Headshot Kills' },
        { id: 'headshot-percent', display: 'Headshot %' }
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
    weapons: any[] = [];
    stats: any[] = [];
    svg: any;

    constructor(private api: PlanetsideApi, element: ElementRef, d3Service: D3Service) {
        this.d3 = d3Service.getD3();
    }

    ngOnInit() {
        let d3 = this.d3;
        let element = this.graphElement.nativeElement;

        let svgHeight = element.offsetHeight;
        let svgWidth = element.offsetWidth;
        let margin = { top: 20, right: 20, bottom: 30, left: 50 };

        this.svg = this.d3.select(element)
            .append('svg:svg')
            .attr('viewBox', '0 0 ' + svgWidth + ' ' + svgHeight)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
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
        let weaponId1 = this.selectedWeapon1.value;
        let weaponId2 = this.selectedWeapon2.value;
        let weaponId3 = this.selectedWeapon3.value;

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

    renderGraph() {
        let d3 = this.d3;
        let element = this.graphElement.nativeElement;
        let data1: any[] = this.stats[this.selectedWeapon1.value];
        let data2: any[] = this.stats[this.selectedWeapon2.value];
        let data3: any[] = this.stats[this.selectedWeapon3.value];

        let svgHeight = element.offsetHeight;
        let svgWidth = element.offsetWidth;

        let margin = { top: 20, right: 20, bottom: 30, left: 50 };
        let width = svgWidth - margin.left - margin.right;
        let height = svgHeight - margin.top - margin.bottom

        let x = d3.scaleTime()
            .domain(d3.extent(data1, function(d) { return new Date(d.date); }))
            .range([0, width]);

        let maxValues = [];
        if (data1) {
            maxValues.push(d3.max(data1, function(d) { return d.value; }));
        }
        if (data2) {
            maxValues.push(d3.max(data2, function(d) { return d.value; }));
        }
        if (data3) {
            maxValues.push(d3.max(data3, function(d) { return d.value; }));
        }

        let maxY = Math.max(...maxValues);

        let y = d3.scaleLinear()
            .domain([0, maxY])
            .rangeRound([height, 0]);

        let line = d3.line<any>()
            .defined(function(d) { return d; })
            .x(function(d) { return x(new Date(d.date)); })
            .y(function(d) { return y(d.value); });

        var xAxis = d3.axisBottom(x)
            .tickFormat(d3.timeFormat("%b %e"));

        this.svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        this.svg.append("g")
            .call(d3.axisLeft(y))
            .append("text")
            .attr("fill", "#fff")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end");

        if (data1) {
            this.svg.append('g').append('path')
                .datum(data1)
                .attr('class', 'line1')
                .attr('d', line);
        }
        if (data2) {
            this.svg.append('g').append('path')
                .datum(data2)
                .attr('class', 'line2')
                .attr('d', line);
        }
        if (data3) {
            this.svg.append('g').append('path')
                .datum(data3)
                .attr('class', 'line3')
                .attr('d', line);
        }
    }
}