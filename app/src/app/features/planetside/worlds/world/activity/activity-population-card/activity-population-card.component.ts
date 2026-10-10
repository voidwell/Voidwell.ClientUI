import { Component, ChangeDetectionStrategy, Input, ElementRef, ViewChild, OnChanges, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { PopulationPeriod } from '@core/api/models/ps2/common.model';
import { MatCard, MatCardTitle, MatCardFooter } from '@angular/material/card';

type FactionKey = 'vs' | 'nc' | 'tr' | 'ns';

interface PopulationPoint {
    timestamp: Date;
    vs: number;
    nc: number;
    tr: number;
    ns: number;
}

interface FactionSample {
    timestamp: Date;
    value: number;
    faction: FactionKey;
}

interface FactionLabel {
    label: string;
    class: string;
    value: number;
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'activity-population-card',
    templateUrl: './activity-population-card.component.html',
    styleUrls: ['./activity-population-card.component.css'],
    imports: [MatCard, MatCardTitle, MatCardFooter]
})

export class ActivityPopulationCardComponent implements OnInit, OnChanges {
    @Input() data: PopulationPeriod[];
    @ViewChild('graphContainer', { static: true }) element: ElementRef<HTMLElement>;

    private points: PopulationPoint[] = [];
    private svg: d3.Selection<HTMLElement, unknown, null, undefined>;
    private svgContainer: d3.Selection<SVGGElement, unknown, null, undefined>;
    private xScale: d3.ScaleTime<number, number>;
    private yScale: d3.ScaleLinear<number, number>;
    private height: number;
    private width: number;
    private realHeight: number;
    private realWidth: number;
    private margin: { top: number; right: number; bottom: number; left: number };
    private tipBox: d3.Selection<SVGRectElement, unknown, null, undefined>;
    private tipLine: d3.Selection<SVGLineElement, unknown, null, undefined>;
    private tooltip: d3.Selection<d3.BaseType, unknown, HTMLElement, undefined>;
    private bisectTimestamp = d3.bisector((d: PopulationPoint) => d.timestamp).left;

    private xAxis: d3.Axis<Date | d3.NumberValue>;
    private yAxis: d3.Axis<d3.NumberValue>;

    private labelData: Record<FactionKey, FactionLabel> = {
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

    private strokeMap: Record<FactionKey, string> = {
        'vs': '#8f45bb',
        'nc': '#1565C0',
        'tr': '#C62828',
        'ns': '#828486'
    };

    ngOnInit() {
        this.createSvg();
    }

    private createSvg() {

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

        this.xAxis = d3.axisBottom<Date | d3.NumberValue>(this.xScale)
            .tickFormat((domain) => {
                const d = new Date(domain.valueOf());
                const hour = this.pad(d.getUTCHours());
                const minutes = this.pad(d.getUTCMinutes());
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
            .attr('opacity', 0);

        this.tipBox
            .on('mousemove', (ev: MouseEvent) => {
                this.points.sort((a, b) => { return a.timestamp.getTime() - b.timestamp.getTime(); });

                const mouseX = d3.pointer(ev, this.tipBox.node())[0];
                const x0 = this.xScale.invert(mouseX);
                const i = this.bisectTimestamp(this.points, x0, 1);
                const d0 = this.points[i - 1];
                const d1 = this.points[i];

                const targetData = x0.getTime() - d0.timestamp.getTime() > d1.timestamp.getTime() - x0.getTime() ? d1 : d0;

                let tipHtml = '';
                let tipTotal = 0;

                (Object.keys(this.labelData) as FactionKey[])
                    .map((k) => {
                        this.labelData[k].value = targetData[k];
                        return this.labelData[k];
                    })
                    .sort((a, b) => b.value - a.value)
                    .forEach((d) => {
                        tipHtml += `<div><span class="${d.class}">${d.label}</span>: ${d.value}</div>`
                        tipTotal += d.value;
                    });
                tipHtml += `<div>Total: ${tipTotal}</div>`;

                this.tipLine.style('display', 'inline')
                    .attr('x1', this.xScale(targetData.timestamp))
                    .attr('x2', this.xScale(targetData.timestamp))
                    .attr('y1', 0)
                    .attr('y2', this.height);

                this.tooltip.html(targetData.timestamp.toUTCString())
                    .style('display', 'block')
                    .style('left', `${ev.offsetX + 20}px`)
                    .style('top', `${ev.offsetY - 20}px`)
                    .append('div')
                    .html(tipHtml);
            })
            .on('mouseout', () => {
                if (this.tooltip) this.tooltip.style('display', 'none');
                if (this.tipLine) this.tipLine.style('display', 'none');
            });
    }

    ngOnChanges() {
        this.update();
    }

    private update() {

        if (!this.data || !this.svgContainer) {
            return;
        }

        this.points = this.data.map(d => ({
            timestamp: d3.isoParse(d.timestamp),
            vs: d.vs,
            nc: d.nc,
            tr: d.tr,
            ns: d.ns
        }));

        const sample = (faction: FactionKey): FactionSample[] =>
            this.points.map(x => ({ timestamp: x.timestamp, value: x[faction], faction }));
        const groupData = d3.group(
            [...sample('vs'), ...sample('nc'), ...sample('tr'), ...sample('ns')],
            d => d.faction);

        this.xScale.domain(d3.extent(this.points, d => d.timestamp));
        this.svgContainer.select<SVGGElement>('.x-axis')
            .transition()
            .duration(1500)
            .call(this.xAxis);

        this.yScale.domain([
                d3.min(this.points, d => d3.min([d.vs, d.nc, d.tr, d.ns])),
                d3.max(this.points, d => d3.max([d.vs, d.nc, d.tr, d.ns]))
            ]);
        this.svgContainer.select<SVGGElement>('.y-axis')
            .transition()
            .duration(1500)
            .call(this.yAxis);

        this.svgContainer.selectAll('.line')
            .data(groupData)
            .join('path')
            .transition()
            .duration(1500)
            .attr('class', 'line')
            .attr('d', (d) => {
                const line = d3.line<FactionSample>()
                    .x((n) => { return this.xScale(n.timestamp); })
                    .y((n) => { return this.yScale(n.value); });

                return line(d[1]);
            })
            .style('stroke', (d) => { return this.strokeMap[d[0]]; });
    }

    private pad(value: number) {
        return (value < 10 ? '0' : '') + value;
    }
}
