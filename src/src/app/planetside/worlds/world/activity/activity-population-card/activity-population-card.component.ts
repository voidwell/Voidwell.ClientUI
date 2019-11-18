import { Component, Input, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import {  D3Service, D3 } from 'd3-ng2-service';
import { Selection } from 'd3-selection';
import 'd3-transition';

@Component({
    selector: 'activity-population-card',
    templateUrl: './activity-population-card.template.html',
    styleUrls: ['./activity-population-card.styles.css']
})

export class ActivityPopulationCardComponent implements OnChanges {
    @Input('data') populationData: any[];
    @ViewChild('graphContainer') element: ElementRef;

    private d3: D3;
    private svg;
    private svgContainer: Selection<SVGGElement, unknown, null, undefined>;
    private xScale;
    private yScale;
    private height: number;
    private width: number;
    private realHeight: number;
    private realWidth: number;
    private margin;
    private tipBox: any;
    private tipLine: any;
    private tooltip: any;
    private bisectTimestamp;

    private xAxis: any;
    private yAxis: any;

    private vsLine: any;
    private ncLine: any;
    private trLine: any;
    private nsLine: any;

    private labelData = {
        vs: {
            label: 'Vanu Sovereignty',
            class: 'faction-vs-text',
            value: 0
        },
        nc: {
            label: 'New Conglomerate',
            class: 'faction-nc-text',
            value: 0
        },
        tr: {
            label: 'Terran Republic',
            class: 'faction-tr-text',
            value: 0
        },
        ns: {
            label: 'Nanite Systems',
            class: 'faction-ns-text',
            value: 0
        }
    };

    constructor(d3Service: D3Service) {
        this.d3 = d3Service.getD3();
        this.bisectTimestamp = this.d3.bisector(function(d: any) { return d.timestamp; }).left;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (!this.svg) {
            this.setup();
        }
        if (!this.populationData) {
            return;
        }

        if (changes.populationData.isFirstChange()) {
            this.init();
        } else {
            this.update();
        }
    }

    private setup() {
        let d3 = this.d3;

        this.svg = d3.select(this.element.nativeElement);
        this.tooltip = d3.select('#tooltip');

        this.margin = {top: 0, right: 20, bottom: 30, left: 40};
        this.realHeight = this.element.nativeElement.offsetHeight;
        this.realWidth = this.element.nativeElement.offsetWidth;
        this.height = this.realHeight - this.margin.top - this.margin.bottom;
        this.width = this.realWidth - this.margin.left - this.margin.right;

        this.svgContainer = this.svg.append('div')
            .classed('svg-container', true)
            .append('svg:svg')
            .attr('viewBox', `0 0 ${this.realWidth} ${this.realHeight}`)
            .classed('svg-content-responsive', true)
            .append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
        
        this.tipLine = this.svgContainer.append('line')
            .attr('class', 'tipline');

        this.tipBox = this.svgContainer.append('rect')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('opacity', 0);
    }

    private init() {
        let self = this;
        let d3 = this.d3;

        this.populationData.forEach(function(d) {
            d.timestamp = d3.isoParse(d.timestamp);
        });

        this.updateScales();

        this.tipBox
            .on('mousemove', function() {
                self.populationData.sort(function(a, b) { return a.timestamp - b.timestamp; });

                let x0 = self.xScale.invert(self.d3.mouse(self.tipBox.node())[0]);
                let i = self.bisectTimestamp(self.populationData, x0, 1);
                let d0 = self.populationData[i - 1];
                let d1 = self.populationData[i];
                let targetData = x0 - d0.timestamp > d1.timestamp - x0 ? d1 : d0;

                let tipHtml = '';
                let tipTotal = 0;

                Object.keys(self.labelData)
                    .map((k) => {
                        self.labelData[k].value = targetData[k];
                        return self.labelData[k];
                    })
                    .sort((a, b) => b.value - a.value)
                    .forEach(function(d) {
                        tipHtml += `<div><span class="${d.class}">${d.label}</span>: ${d.value}</div>`
                        tipTotal += d.value;
                    });
                tipHtml += `<div>Total: ${tipTotal}</div>`;

                self.tipLine.style('display', 'inline')
                    .attr('x1', self.xScale(targetData.timestamp))
                    .attr('x2', self.xScale(targetData.timestamp))
                    .attr('y1', 0)
                    .attr('y2', self.height);

                self.tooltip.html(targetData.timestamp.toUTCString())
                    .style('display', 'block')
                    .style('left', `${self.d3.event.offsetX + 20}px`)
                    .style('top', `${self.d3.event.offsetY - 20}px`)
                    .append('div')
                    .html(tipHtml);
            })
            .on('mouseout', function() {
                if (self.tooltip) self.tooltip.style('display', 'none');
                if (self.tipLine) self.tipLine.style('display', 'none');
            });

        this.vsLine = d3.line<any>()
            .x(function(d) { return self.xScale(d.timestamp); })
            .y(function(d) { return self.yScale(d.vs) });

        this.ncLine = d3.line<any>()
            .x(function(d) { return self.xScale(d.timestamp); })
            .y(function(d) { return self.yScale(d.nc) });

        this.trLine = d3.line<any>()
            .x(function(d) { return self.xScale(d.timestamp); })
            .y(function(d) { return self.yScale(d.tr) });

        this.nsLine = d3.line<any>()
            .x(function(d) { return self.xScale(d.timestamp); })
            .y(function(d) { return self.yScale(d.ns) });

        this.updateData();
        this.createAxis();

        this.svgContainer.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${this.height})`)
            .call(this.xAxis);

        this.svgContainer.append("g")
            .attr('class', 'y-axis')
            .call(this.yAxis);
    }

    private update() {
        let d3 = this.d3;

        this.populationData.forEach(function(d) {
            d.timestamp = d3.isoParse(d.timestamp);
        })
        
        this.updateScales();
        this.updateData();
        this.updateAxis();
    }

    private updateScales() {
        let d3 = this.d3;

        this.xScale = this.d3.scaleUtc()
            .domain(d3.extent(this.populationData, function(d) { return d.timestamp; }))
            .range([0, this.width]);

        this.yScale = this.d3.scaleLinear()
            .domain([
                d3.min(this.populationData, function (d) { return d3.min([d.vs, d.nc, d.tr, d.ns]); }),
                d3.max(this.populationData, function (d) { return d3.max([d.vs, d.nc, d.tr, d.ns]); })
            ])
            .range([this.height, 0]);
    }

    private updateData() {
        let d3 = this.d3; // Unused

        this.svgContainer.selectAll('path').remove();

        let paths = this.svgContainer.selectAll('path')
            .data([this.populationData]);

        let newPaths = paths.enter();

        newPaths.append('path')
            .attr('class', 'line vs-line')
            .style('stroke', '#8f45bb')
            .attr('d', this.vsLine);

        newPaths.append('path')
            .attr('class', 'line nc-line')
            .style('stroke', '#1565C0')
            .attr('d', this.ncLine);

        newPaths.append('path')
            .attr('class', 'line tr-line')
            .style('stroke', '#C62828')
            .attr('d', this.trLine);

        newPaths.append('path')
            .attr('class', 'line ns-line')
            .style('stroke', '#828486')
            .attr('d', this.nsLine);
    }

    private createAxis() {
        let self = this;
        let d3 = this.d3;

        this.xAxis = d3.axisBottom(this.xScale)
            .tickFormat(function(domain, i) {
                let d = new Date(domain.valueOf());
                let hour = self.pad(d.getUTCHours());
                let minutes = self.pad(d.getUTCMinutes());
                return `${hour}:${minutes}`
            });
        
        this.yAxis = d3.axisLeft(this.yScale);
    }

    private updateAxis() {
        let d3 = this.d3; // Unused

        this.createAxis();

        this.svgContainer.select('.x-axis')
            .transition()
            .call(this.xAxis);

        this.svgContainer.select('.y-axis')
            .transition()
            .call(this.yAxis);
    }

    private pad(value: number) {
        return (value < 10 ? '0' : '') + value;
    }
}
