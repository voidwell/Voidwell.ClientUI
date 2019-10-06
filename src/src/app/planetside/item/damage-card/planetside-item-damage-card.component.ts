import { Component, Input, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';
import { D3Service, D3 } from 'd3-ng2-service';

@Component({
    selector: 'planetside-item-damage-card',
    templateUrl: './planetside-item-damage-card.template.html',
    styleUrls: ['./planetside-item-damage-card.styles.css'],
    encapsulation: ViewEncapsulation.None
})

export class PlanetsideItemDamageCardComponent implements OnInit {
    @Input() weaponData: any;

    private d3: D3;
    private parentNativeElement: any;

    constructor(element: ElementRef, d3Service: D3Service) {
        this.d3 = d3Service.getD3();
        this.parentNativeElement = element.nativeElement;
    }

    ngOnInit() {
        let maxRange = this.weaponData.maxDamageRange;
        let minRange = this.weaponData.minDamageRange;
        let maxDamage = this.weaponData.maxDamage;
        let minDamage = this.weaponData.minDamage;

        let d3 = this.d3;
        let damageElem = this.parentNativeElement;

        let margin = { top: 5, right: 10, bottom: 20, left: 30 };
        let width = 320 - margin.left - margin.right;
        let height = 130 - margin.top - margin.bottom;

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

        let x = d3.scaleLinear().domain(x_domain).range([0, width]);
        let y = d3.scaleLinear().domain([y_domain[0] * 0.9, y_domain[1] * 1.1]).nice().range([height, 0]);

        let xAxis = d3.axisBottom(x).ticks(5);
        let yAxis = d3.axisLeft(y).ticks(3)
            .tickSizeInner(-width)
            .tickSizeOuter(0)
            .tickPadding(5);

        let valueline = d3.line()
            .x(function (d: any) { return x(d[0]); })
            .y(function (d: any) { return y(d[1]); });

        let svg = d3.select(damageElem)
            .append('svg')
            .attr('class', 'weapon-item-chart')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        let flatChartData = chartData.map(function (d) {
            let val: [number, number] = [d.range, d.damage];
            return val;
        });

        svg.append('path')
            .attr('class', 'line')
            .attr('d', valueline(flatChartData));

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis);
    }
}