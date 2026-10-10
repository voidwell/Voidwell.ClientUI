import { Component, ChangeDetectionStrategy, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { DecimalPipe } from '@angular/common';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'planetside-player-stats-siege-card',
    templateUrl: './planetside-player-stats-siege-card.component.html',
    styleUrls: ['./planetside-player-stats-siege-card.component.css'],
    imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatIcon, MatCardFooter, DecimalPipe]
})

export class PlanetsidePlayerStatsSiegeCardComponent implements OnInit {
    @Input() captured: number;
    @Input() defended: number;
    @ViewChild('siegegauge', { static: true }) gaugeElement: ElementRef<HTMLElement>;

    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;

    public siegeLevel: number;

    ngOnInit() {
        this.createSvg();
        this.drawData();
    }

    private createSvg() {
        this.svg = d3.select(this.gaugeElement.nativeElement)
            .append('svg:svg');
    }

    private drawData() {
        const deg2rad = (deg: number) => {
            return deg * Math.PI / 180;
        };

        const centerTranslation = () => {
            return 'translate(' + r + ',' + r + ')';
        };

        const configure = () => {
            range = config.maxAngle - config.minAngle;
            r = config.size / 2;
            pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

            // a linear scale that maps domain values to a percent from 0..1
            scale = d3.scaleLinear()
                .range([0, 1])
                .domain([config.minValue, config.maxValue]);

            ticks = scale.ticks(config.textTicks);

            arc = d3.arc<number>()
                .innerRadius(r - config.ringWidth - config.ringInset)
                .outerRadius(r - config.ringInset)
                .startAngle((d: number, i: number) => {
                    const ratio = d * i;
                    return deg2rad(config.minAngle + (ratio * range));
                })
                .endAngle((d: number, i: number) => {
                    const ratio = d * (i + 1);
                    return deg2rad(config.minAngle + (ratio * range));
                });
        };

        const render = (newValue?: number) => {
            const centerTx = centerTranslation();

            this.svg.append('g')
                .attr('transform', centerTx)
                .selectAll('path')
                .data(d3.range(500).map(() => { return 1 / 500; }))
                .enter().append('path')
                .attr('d', arc)
                .style('fill', (d, i) => { return config.arcColorFn(d * i); });

            const lg = this.svg.append('g')
                    .attr('class', 'label')
                    .attr('transform', centerTx);
            lg.selectAll('text')
                    .data(ticks)
                .enter().append('text')
                    .attr('transform', (d) => {
                        const ratio = scale(d);
                        const newAngle = config.minAngle + (ratio * range);
                        return 'rotate(' + newAngle + ') translate(0,' + (config.labelInset - r) + ')';
                    })
                    .text(config.labelFormat);

            const lineData: [number, number][] = [ [config.pointerWidth / 2, 0],
                            [0, -pointerHeadLength],
                            [-(config.pointerWidth / 2), 0],
                            [0, config.pointerTailLength],
                            [config.pointerWidth / 2, 0] ];
            const pointerLine = d3.line();
            const pg = this.svg.append('g').data([lineData])
                    .attr('class', 'pointer')
                    .attr('transform', centerTx);

            pointer = pg.append('path')
                .attr('d', pointerLine/*(d) => { return pointerLine(d) +'Z';}*/ )
                .attr('transform', 'rotate(' + config.minAngle + ')');

            update(newValue === undefined ? 0 : newValue);
        };

        const update = (newValue: number) => {
            const ratio = scale(newValue);
            const newAngle = config.minAngle + (ratio * range);

            pointer.transition()
                .duration(config.transitionMs)
                .ease(d3.easeElastic)
                .attr('transform', 'rotate(' + newAngle + ')');
        };
        this.siegeLevel = this.captured / this.defended * 100;

        const config = {
            size						: 200,
            ringInset					: 20,
            ringWidth					: 30,

            pointerWidth				: 5,
            pointerTailLength			: 5,
            pointerHeadLengthPercent	: 0.9,

            minValue					: 0,
            maxValue					: 100,

            minAngle					: -90,
            maxAngle					: 90,

            transitionMs				: 4000,

            majorTicks					: 500,
            textTicks                   : 10,
            labelFormat					: d3.format(''),
            labelInset					: 10,

            arcColorFn					: d3.interpolateHsl('#686e7d', '#b11b1b')
        };

        let range: number;
        let r: number;
        let pointerHeadLength: number;

        let arc: d3.Arc<unknown, number>;
        let scale: d3.ScaleLinear<number, number>;
        let ticks: number[];
        let pointer: d3.Selection<SVGPathElement, [number, number][], null, undefined>;

        configure();
        render(undefined);
        update(Math.min(this.siegeLevel, 100));
    }
}
