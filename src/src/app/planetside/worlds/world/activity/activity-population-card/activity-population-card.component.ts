import { Component, Input, ElementRef, ViewChild, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'activity-population-card',
    templateUrl: './activity-population-card.template.html',
    styleUrls: ['./activity-population-card.styles.css']
})

export class ActivityPopulationCardComponent implements OnInit, OnChanges {
    @Input('data') populationData: any[];
    @ViewChild('graphContainer', { static: true }) element: ElementRef;

    private svg;
    private svgContainer: d3.Selection<SVGGElement, unknown, null, undefined>;
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

    private strokeMap = {
        'vs': '#8f45bb',
        'nc': '#1565C0',
        'tr': '#C62828',
        'ns': '#828486'
    };

    constructor() {
        this.bisectTimestamp = d3.bisector(function(d: any) { return d.timestamp; }).left;
    }

    ngOnInit() {
        this.createSvg();
    }

    private createSvg() {
        let self = this;

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
            
        this.xScale = d3.scaleUtc().range([0, this.width]);

        this.yScale = d3.scaleLinear().range([this.height, 0]);

        this.xAxis = d3.axisBottom(this.xScale)
            .tickFormat(function(domain, i) {
                let d = new Date(domain.valueOf());
                let hour = self.pad(d.getUTCHours());
                let minutes = self.pad(d.getUTCMinutes());
                return `${hour}:${minutes}`
            });
        
        this.yAxis = d3.axisLeft(this.yScale);

        this.svgContainer.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${this.height})`)
            .call(this.xAxis);

        this.svgContainer.append("g")
            .attr('class', 'y-axis')
            .call(this.yAxis);

        this.update();
        
        this.tipLine = this.svgContainer.append('line')
            .attr('class', 'tipline');

        this.tipBox = this.svgContainer.append('rect')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('opacity', 0)
            .on('mousemove', function(ev) {
                self.populationData.sort(function(a, b) { return a.timestamp - b.timestamp; });

                let mouseX = d3.pointer(ev, self.tipBox.node())[0];
                let x0 = self.xScale.invert(mouseX);
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
                    .style('left', `${ev.offsetX + 20}px`)
                    .style('top', `${ev.offsetY - 20}px`)
                    .append('div')
                    .html(tipHtml);
            })
            .on('mouseout', function() {
                if (self.tooltip) self.tooltip.style('display', 'none');
                if (self.tipLine) self.tipLine.style('display', 'none');
            });
    }

    ngOnChanges(changes: SimpleChanges) {
        this.update();
    }

    private update() {
        let self = this;

        if (!this.populationData || !this.svgContainer) {
            return;
        }

        this.populationData.forEach(function(d) {
            d.timestamp = d3.isoParse(d.timestamp);
        });

        let vsData = this.populationData.map(x => ({ timestamp: x.timestamp, value: x.vs, faction: 'vs' }));
        let ncData = this.populationData.map(x => ({ timestamp: x.timestamp, value: x.nc, faction: 'nc' }));
        let trData = this.populationData.map(x => ({ timestamp: x.timestamp, value: x.tr, faction: 'tr' }));
        let nsData = this.populationData.map(x => ({ timestamp: x.timestamp, value: x.ns, faction: 'ns' }));
        let groupData = d3.group([].concat(vsData, ncData, trData, nsData), function(d) { return d.faction;});

        this.xScale.domain(d3.extent(this.populationData, function(d) { return d.timestamp; }));
        this.svgContainer.select('.x-axis')
            .transition()
            .duration(1500)
            .call(this.xAxis);

        this.yScale.domain([
                d3.min(this.populationData, function (d) { return d3.min([d.vs, d.nc, d.tr, d.ns]); }),
                d3.max(this.populationData, function (d) { return d3.max([d.vs, d.nc, d.tr, d.ns]); })
            ]);
        this.svgContainer.select('.y-axis')
            .transition()
            .duration(1500)
            .call(this.yAxis);

        this.svgContainer.selectAll('.line')
            .data(groupData)
            .join('path')
            .transition()
            .duration(1500)
            .attr('class', 'line')
            .attr('d', function(d) {
                return d3.line()
                    .x(function(n) { return self.xScale(n.timestamp); })
                    .y(function(n) { return self.yScale(n.value); })
                    (d[1]);
            })
            .style('stroke', function(d){ return self.strokeMap[d[0]]; });
    }

    private pad(value: number) {
        return (value < 10 ? '0' : '') + value;
    }
}
