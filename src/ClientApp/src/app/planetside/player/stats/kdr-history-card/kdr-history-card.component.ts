import { Component, Input, OnInit, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { D3Service, D3 } from 'd3-ng2-service';

@Component({
    selector: 'kdr-history-card',
    templateUrl: './kdr-history-card.template.html',
    styleUrls: ['./kdr-history-card.styles.css']
})

export class KdrHistoryCardComponent implements OnInit {
    @Input() kills: number[];
    @Input() deaths: number[];
    @ViewChild('kdrlines') kdrLinesElement: ElementRef;

    private d3: D3;
    private svg;
    private svgContainer;
    private xScale;
    private yScale;
    private yLine;
    private height: number;
    private width: number;
    private d3Area;
    private d3Line;
    private maxValue: number;
    private tooltipContainer;

    constructor(public element: ElementRef, d3Service: D3Service) {
        this.d3 = d3Service.getD3();
    }

    ngOnInit() {
        of(null).pipe(delay(50))
            .subscribe(() => this.setup());
    }

    private setup() {
        let self = this;
        let d3 = this.d3;

        let kdrLinesElem = this.kdrLinesElement.nativeElement;
        this.maxValue = Math.max(d3.max(this.kills), d3.max(this.deaths));

        this.svg = d3.select(kdrLinesElem)

        this.height = this.kdrLinesElement.nativeElement.offsetHeight;
        this.width = this.kdrLinesElement.nativeElement.offsetWidth;

        let killsData = self.kills.map(function (d, i): [number, number] {
            return [i, d];
        });

        let deathsData = self.deaths.map(function (d, i): [number, number] {
            return [i, d];
        });

        let kdrData = self.kills.map(function (d, i): [number, number] {
            let kd = self.deaths[i] > 0 ? d / self.deaths[i] : 0;
            return [i, kd];
        });

        this.xScale = this.d3.scaleLinear()
            .domain([0, this.kills.length - 1])
            .range([0, this.width]);

        this.yScale = this.d3.scaleLinear()
            .domain([0, this.maxValue])
            .range([this.height, 0]);

        this.yLine = this.d3.scaleLinear()
            .domain([0, this.d3.max(kdrData.map(function (d) { return d[1]; }))])
            .range([this.height, 0]);

        this.tooltipContainer = this.d3.select('body').append("div")
            .attr("class", "vw-card-tooltip")
            .style("opacity", 0);

        this.d3Area = this.d3.area()
            .x(function (d, i) {
                return self.xScale(i);
            })
            .y0(this.height)
            .y1(function (d) {
                return self.yScale(d[1]);
            });

        this.d3Line = this.d3.line()
            .x(function (d, i) {
                return self.xScale(i);
            })
            .y(function (d) {
                return self.yLine(d[1]);
            });

        this.svgContainer = this.svg.append('div')
            .classed('svg-container', true)
            .append('svg:svg')
            .attr('viewBox', '0 0 ' + this.width + ' ' + this.height)
            .classed('svg-content-responsive', true);

        this.svgContainer.append('path')
            .datum(deathsData)
            .attr('class', 'area-back')
            .attr('d', this.d3Area);

        this.svgContainer.append('path')
            .datum(killsData)
            .attr('class', 'area-fore')
            .attr('d', this.d3Area);

        this.svgContainer.append('path')
            .datum(kdrData)
            .attr('class', 'line')
            .attr('d', this.d3Line);

        this.svgContainer.selectAll('circle.tt-area-back')
            .data(deathsData)
            .enter()
            .append('circle')
            .attr('class', 'tt-area-back tt-area-focus tt-focus')
            .attr('r', 5)
            .attr('cx', function (d) { return self.xScale(d[0]); })
            .attr('cy', function (d) { return self.yScale(d[1]); })
            .on('mouseover', function (d) {
                self.tooltipContainer.transition()
                    .duration(200)
                    .style('opacity', 0.9);
                self.tooltipContainer.html('D: ' + d[0] + ', Deaths: ' + d[1])
                    .style('left', (d3.event.pageX) + 'px')
                    .style('top', (d3.event.pageY - 28) + 'px');
            })
            .on("mouseout", function (d) {
                self.tooltipContainer.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        this.svgContainer.selectAll('circle.tt-area-fore')
            .data(killsData)
            .enter()
            .append('circle')
            .attr('class', 'tt-area-fore tt-area-focus tt-focus')
            .attr('r', 5)
            .attr('cx', function (d) { return self.xScale(d[0]); })
            .attr('cy', function (d) { return self.yScale(d[1]); })
            .on('mouseover', function (d) {
                self.tooltipContainer.transition()
                    .duration(200)
                    .style('opacity', 0.9);
                self.tooltipContainer.html('D: ' + d[0] + ', Kills: ' + d[1])
                    .style('left', (d3.event.pageX) + 'px')
                    .style('top', (d3.event.pageY - 28) + 'px');
            })
            .on("mouseout", function (d) {
                self.tooltipContainer.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        this.svgContainer.selectAll('circle.tt-line')
            .data(kdrData)
            .enter()
            .append('circle')
            .attr('class', 'tt-line-focus tt-focus')
            .attr('r', 5)
            .attr('cx', function (d) { return self.xScale(d[0]); })
            .attr('cy', function (d) { return self.yScale(d[1]); })
            .on('mouseover', function (d) {
                self.tooltipContainer.transition()
                    .duration(200)
                    .style('opacity', 0.9);
                self.tooltipContainer.html('D: ' + d[0] + ', KdR: ' + d[1].toFixed(2))
                    .style('left', (d3.event.pageX) + 'px')
                    .style('top', (d3.event.pageY - 28) + 'px');
            })
            .on("mouseout", function (d) {
                self.tooltipContainer.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        d3.select(window)
            .on('resize', () => {
                this.resize();
            });

        this.resize();
    }

    private resize() {
        let self = this;

        this.height = this.kdrLinesElement.nativeElement.offsetHeight;
        this.width = this.kdrLinesElement.nativeElement.offsetWidth;

        this.xScale.range([0, this.width]);
        this.yScale.range([this.height, 0]);
        this.yLine.range([this.height, 0]);

        this.d3Area = this.d3.area()
            .x(function (d, i) {
                return self.xScale(i);
            })
            .y0(this.height)
            .y1(function (d) {
                return self.yScale(d[1]);
            });

        this.d3Line = this.d3.line()
            .x(function (d, i) {
                return self.xScale(i);
            })
            .y(function (d) {
                return self.yLine(d[1]);
            });

        this.svg.select('.area-fore')
            .attr('d', this.d3Area);
        this.svg.select('.area-back')
            .attr('d', this.d3Area);
        this.svg.select('.line')
            .attr('d', this.d3Line);

        this.svg.selectAll('.tt-area-focus')
            .attr('cx', function (d) { return self.xScale(d[0]); })
            .attr('cy', function (d) { return self.yScale(d[1]); });
        this.svg.selectAll('.tt-line-focus')
            .attr('cx', function (d) { return self.xScale(d[0]); })
            .attr('cy', function (d) { return self.yLine(d[1]); });
            

        this.svg.select('svg')
            .attr('viewBox', '0 0 ' + this.width + ' ' + this.height);
    }
}