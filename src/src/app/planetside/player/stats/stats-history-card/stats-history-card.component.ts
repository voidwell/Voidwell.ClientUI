import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { D3Service, D3 } from 'd3-ng2-service';

@Component({
    selector: 'stats-history-card',
    templateUrl: './stats-history-card.template.html',
    styleUrls: ['./stats-history-card.styles.css']
})

export class StatsHistoryCardComponent implements OnInit, OnDestroy {
    @Input('type') statsType: string;
    @Input('data') statsHistoryData: any[];
    @Input('period') period: string;
    @ViewChild('graphContainer') element: ElementRef;

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
    private maxAreaValue: number;
    private maxLineValue: number;
    private tooltipContainer;
    private uId = Math.random().toString(36).substring(2);

    private transformedData = {
        day: {},
        week: {},
        month: {}
    };

    private statsConfigurations = [
        {
            type: 'kdr',
            title: 'KdR Last 31 Days (Older->)',
            line: {
                value: d => d.deaths > 0 ? d.kills / d.deaths : 0,
                label: 'KdR',
                format: v => v.toFixed(2)
            },
            area: [
                {
                    value: d => d.deaths,
                    label: 'Deaths'
                },
                {
                    value: d => d.kills,
                    label: 'Kills'
                }
            ]
        },
        {
            type: 'siege',
            title: 'Siege Last 31 Days (Older->)',
            line: {
                value: d => d.facility_defend > 0 ? d.facility_capture / d.facility_defend * 100 : 0,
                label: 'Siege',
                format: v => v.toFixed(0)
            },
            area: [
                {
                    value: d => d.facility_defend,
                    label: 'Defends'
                },
                {
                    value: d => d.facility_capture,
                    label: 'Captures'
                }
            ]
        },
        {
            type: 'spm',
            title: 'SPM Last 31 Days (Older->)',
            line: {
                value: d => d.time > 0 ? d.score / (d.time / 3600) : 0,
                label: 'SpM',
                format: v => v.toFixed(1)
            },
            area: [
                {
                    value: d => d.score,
                    label: 'Score'
                },
                {
                    value: d => d.time / 3600,
                    label: 'Time'
                }
            ]
        },
        {
            type: 'kpm',
            title: 'KPM Last 31 Days (Older->)',
            line: {
                value: d => d.time > 0 ? d.kills / (d.time / 3600) : 0,
                label: 'KpM',
                format: v => v.toFixed(1)
            },
            area: [
                {
                    value: d => d.time,
                    label: 'Time'
                },
                {
                    value: d => d.kills,
                    label: 'Kills'
                }
            ]
        }
    ];

    public activeConfig: any;
    private activeData: any[];

    constructor(d3Service: D3Service) {
        this.d3 = d3Service.getD3();
    }

    ngOnInit() {
        if (!this.statsHistoryData) {
            return;
        }

        this.activeConfig = this.getConfiguration(this.statsType);
        if (!this.activeConfig) {
            return;
        }

        for (let i = 0; i < this.statsHistoryData.length; i++) {
            let stat = this.statsHistoryData[i];

            for (let k = 0; k < stat.day.length; k++) {
                if (!this.transformedData.day[k]) {
                    this.transformedData.day[k] = {};
                }

                this.transformedData.day[k][stat.statName] = stat.day[k];
            }

            for (let k = 0; k < stat.week.length; k++) {
                if (!this.transformedData.week[k]) {
                    this.transformedData.week[k] = {};
                }

                this.transformedData.week[k][stat.statName] = stat.week[k];
            }

            for (let k = 0; k < stat.month.length; k++) {
                if (!this.transformedData.month[k]) {
                    this.transformedData.month[k] = {};
                }

                this.transformedData.month[k][stat.statName] = stat.month[k];
            }
        }

        this.activeData = Object.keys(this.transformedData[this.period]).map(k => this.transformedData[this.period][k]);

        of(null).pipe(delay(50))
            .subscribe(() => this.setup());
    }

    private getConfiguration(type: string): any {
        for (let i = 0; i < this.statsConfigurations.length; i++) {
            if (this.statsConfigurations[i].type === type)
                return this.statsConfigurations[i];
        }
    }

    private setup() {
        let self = this;
        let d3 = this.d3;

        this.maxAreaValue = d3.max<number>(this.activeConfig.area.map(d => d3.max(this.activeData.map(a => d.value(a)))));
        this.maxLineValue = d3.max<number>(this.activeData.map(a => this.activeConfig.line.value(a)));

        this.svg = d3.select(this.element.nativeElement);

        this.height = this.element.nativeElement.offsetHeight;
        this.width = this.element.nativeElement.offsetWidth;

        this.xScale = this.d3.scaleLinear()
            .domain([0, this.activeData.length - 1])
            .range([0, this.width]);

        this.yScale = this.d3.scaleLinear()
            .domain([0, this.maxAreaValue])
            .range([this.height, 0]);

        this.yLine = this.d3.scaleLinear()
            .domain([0, this.maxLineValue])
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

        for (let i = 0; i < this.activeConfig.area.length; i++) {
            let areaClass = i === 0 ? 'back' : 'fore';
            let areaData = this.activeData.map((d, k) => [k, this.activeConfig.area[i].value(d)]);

            this.svgContainer.append('path')
                .datum(areaData)
                .attr('class', 'area-' + areaClass)
                .attr('d', this.d3Area);

            this.svgContainer.selectAll('circle.tt-area-' + areaClass)
                .data(areaData)
                .enter()
                .append('circle')
                .attr('class', 'tt-area-focus tt-focus tt-area-' + areaClass)
                .attr('r', 5)
                .attr('cx', function (d) { return self.xScale(d[0]); })
                .attr('cy', function (d) { return self.yScale(d[1]); })
                .on('mouseover', function (d) {
                    let value = self.activeConfig.area[i].format ? self.activeConfig.area[i].format(d[1]) : d[1];

                    self.tooltipContainer.transition()
                        .duration(200)
                        .style('opacity', 0.9);
                    self.tooltipContainer.html('D: ' + d[0] + ', ' + self.activeConfig.area[i].label + ': ' + value)
                        .style('left', (d3.event.pageX) + 'px')
                        .style('top', (d3.event.pageY - 28) + 'px');
                })
                .on("mouseout", function (d) {
                    self.tooltipContainer.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        }

        if (this.activeConfig.line) {
            let lineData = this.activeData.map((d, i) => [i, this.activeConfig.line.value(d)]);

            this.svgContainer.append('path')
                .datum(lineData)
                .attr('class', 'line')
                .attr('d', this.d3Line);

            this.svgContainer.selectAll('circle.tt-line')
                .data(lineData)
                .enter()
                .append('circle')
                .attr('class', 'tt-line-focus tt-focus')
                .attr('r', 5)
                .attr('cx', function (d) { return self.xScale(d[0]); })
                .attr('cy', function (d) { return self.yScale(d[1]); })
                .on('mouseover', function (d) {
                    let value = self.activeConfig.line.format ? self.activeConfig.line.format(d[1]) : d[1];

                    self.tooltipContainer.transition()
                        .duration(200)
                        .style('opacity', 0.9);

                    self.tooltipContainer.html('D: ' + d[0] + ', ' + self.activeConfig.line.label + ': ' + value)
                        .style('left', (d3.event.pageX) + 'px')
                        .style('top', (d3.event.pageY - 28) + 'px');
                })
                .on('mouseout', function (d) {
                    self.tooltipContainer.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        }

        d3.select(window)
            .on('resize.' + this.uId, () => {
                this.resize();
            });

        this.resize();
    }

    private resize() {
        let self = this;

        this.height = this.element.nativeElement.offsetHeight;
        this.width = this.element.nativeElement.offsetWidth;

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

    ngOnDestroy() {
        this.d3.select(window)
            .on('resize.' + this.uId, null);
    }
}
