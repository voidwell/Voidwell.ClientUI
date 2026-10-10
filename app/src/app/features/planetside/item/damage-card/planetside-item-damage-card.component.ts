import { Component, ChangeDetectionStrategy, Input, OnInit, ElementRef, ViewEncapsulation, inject } from '@angular/core';
import * as d3 from 'd3';
import { WeaponInfoResult } from '@core/api/models/ps2/weapon.model';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'planetside-item-damage-card',
    templateUrl: './planetside-item-damage-card.component.html',
    styleUrls: ['./planetside-item-damage-card.component.css'],
    encapsulation: ViewEncapsulation.None
})

export class PlanetsideItemDamageCardComponent implements OnInit {
    @Input() weaponData: WeaponInfoResult;

    private parentNativeElement: HTMLElement;

    private svg: d3.Selection<SVGGElement, unknown, null, undefined>;
    private margin = { top: 5, right: 10, bottom: 20, left: 30 };
    private width = 320 - this.margin.left - this.margin.right;
    private height = 130 - this.margin.top - this.margin.bottom;

    constructor() {
        const element = inject(ElementRef);

        this.parentNativeElement = element.nativeElement;
    }

    ngOnInit() {
        this.createSvg();
        this.drawData();
    }

    private createSvg() {
        this.svg = d3.select(this.parentNativeElement)
            .append('svg')
            .attr('class', 'weapon-item-chart')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    }

    private drawData() {
        const maxRange = this.weaponData.maxDamageRange;
        const minRange = this.weaponData.minDamageRange;
        const maxDamage = this.weaponData.maxDamage;
        const minDamage = this.weaponData.minDamage;        

        let maxX = Math.max(minRange, 100);
        if (maxX !== 100) {
            maxX += 50;
        }

        const chartData = [
            { range: 0, damage: maxDamage },
            { range: maxRange, damage: maxDamage },
            { range: minRange, damage: minDamage },
            { range: maxX, damage: minDamage },
        ];

        const x_domain = d3.extent(chartData, d => d.range) as [number, number];
        const y_domain = d3.extent(chartData, d => d.damage) as [number, number];

        const x = d3.scaleLinear().domain(x_domain).range([0, this.width]);
        const y = d3.scaleLinear().domain([y_domain[0] * 0.9, y_domain[1] * 1.1]).nice().range([this.height, 0]);

        const xAxis = d3.axisBottom(x).ticks(5);
        const yAxis = d3.axisLeft(y).ticks(3)
            .tickSizeInner(-this.width)
            .tickSizeOuter(0)
            .tickPadding(5);

        const valueline = d3.line<[number, number]>()
            .x(d => x(d[0]))
            .y(d => y(d[1]));

        const flatChartData = chartData.map(function (d) {
            const val: [number, number] = [d.range, d.damage];
            return val;
        });

        this.svg.append('path')
            .attr('class', 'line')
            .attr('d', valueline(flatChartData));

        this.svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + this.height + ')')
            .call(xAxis);

        this.svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis);
    }
}