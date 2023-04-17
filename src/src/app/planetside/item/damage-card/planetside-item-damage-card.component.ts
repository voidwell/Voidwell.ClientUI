import { Component, Input, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'planetside-item-damage-card',
    templateUrl: './planetside-item-damage-card.template.html',
    styleUrls: ['./planetside-item-damage-card.styles.css'],
    encapsulation: ViewEncapsulation.None
})

export class PlanetsideItemDamageCardComponent implements OnInit {
    @Input() weaponData: any;

    private parentNativeElement: any;

    private svg: any;
    private margin = { top: 5, right: 10, bottom: 20, left: 30 };
    private width = 320 - this.margin.left - this.margin.right;
    private height = 130 - this.margin.top - this.margin.bottom;

    constructor(element: ElementRef) {
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
        let maxRange = this.weaponData.maxDamageRange;
        let minRange = this.weaponData.minDamageRange;
        let maxDamage = this.weaponData.maxDamage;
        let minDamage = this.weaponData.minDamage;        

        let maxX = Math.max(minRange, 100);
        if (maxX !== 100) {
            maxX += 50;
        }

        let chartData = [
            { range: 0, damage: maxDamage },
            { range: maxRange, damage: maxDamage },
            { range: minRange, damage: minDamage },
            { range: maxX, damage: minDamage },
        ];

        let x_domain = d3.extent(chartData, function (d: any) { return d.range; });
        let y_domain = d3.extent(chartData, function (d: any) { return d.damage; });

        let x = d3.scaleLinear().domain(x_domain).range([0, this.width]);
        let y = d3.scaleLinear().domain([y_domain[0] * 0.9, y_domain[1] * 1.1]).nice().range([this.height, 0]);

        let xAxis = d3.axisBottom(x).ticks(5);
        let yAxis = d3.axisLeft(y).ticks(3)
            .tickSizeInner(-this.width)
            .tickSizeOuter(0)
            .tickPadding(5);

        let valueline = d3.line()
            .x(function (d: any) { return x(d[0]); })
            .y(function (d: any) { return y(d[1]); });

        let flatChartData = chartData.map(function (d) {
            let val: [number, number] = [d.range, d.damage];
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