import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'planetside-player-stats-siege-card',
    templateUrl: './planetside-player-stats-siege-card.template.html',
    styleUrls: ['./planetside-player-stats-siege-card.styles.css']
})

export class PlanetsidePlayerStatsSiegeCardComponent implements OnInit {
    @Input() captured: number;
    @Input() defended: number;
    @ViewChild('siegegauge', { static: true }) gaugeElement: ElementRef;

    private svg: any;
    private width: 200
    private height: 110;

    public siegeLevel: number;

    ngOnInit() {
        this.createSvg();
        this.drawData();
    }

    private createSvg() {
        this.svg = d3.select(this.gaugeElement.nativeElement)
            .append('svg:svg')
            .attr('width', this.width)
            .attr('height', this.height);
    }

    private drawData() {
        let self = this;
        this.siegeLevel = this.captured / this.defended * 100;

        let config = {
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

        let range = undefined;
        let r = undefined;
        let pointerHeadLength = undefined;

        let arc = undefined;
        let scale = undefined;
        let ticks = undefined;
        let pointer = undefined;

        function deg2rad(deg) {
            return deg * Math.PI / 180;
        }

        function centerTranslation() {
            return 'translate(' + r + ',' + r + ')';
        }

        function configure() {
            range = config.maxAngle - config.minAngle;
            r = config.size / 2;
            pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

            // a linear scale that maps domain values to a percent from 0..1
            scale = d3.scaleLinear()
                .range([0, 1])
                .domain([config.minValue, config.maxValue]);

            ticks = scale.ticks(config.textTicks);

            arc = d3.arc()
                .innerRadius(r - config.ringWidth - config.ringInset)
                .outerRadius(r - config.ringInset)
                .startAngle(function(d: any, i: any) {
                    let ratio = d * i;
                    return deg2rad(config.minAngle + (ratio * range));
                })
                .endAngle(function(d: any, i: any) {
                    let ratio = d * (i + 1);
                    return deg2rad(config.minAngle + (ratio * range));
                });
        }

        function render(newValue) {
            let centerTx = centerTranslation();

            self.svg.append('g')
                .attr('transform', centerTx)
                .selectAll('path')
                .data(d3.range(500).map(function () { return 1 / 500; }))
                .enter().append('path')
                .attr('d', arc)
                .style('fill', function (d, i) { return config.arcColorFn(d * i); });

            let lg = self.svg.append('g')
                    .attr('class', 'label')
                    .attr('transform', centerTx);
            lg.selectAll('text')
                    .data(ticks)
                .enter().append('text')
                    .attr('transform', function(d) {
                        let ratio = scale(d);
                        let newAngle = config.minAngle + (ratio * range);
                        return 'rotate(' + newAngle + ') translate(0,' + (config.labelInset - r) + ')';
                    })
                    .text(config.labelFormat);

            let lineData = [ [config.pointerWidth / 2, 0],
                            [0, -pointerHeadLength],
                            [-(config.pointerWidth / 2), 0],
                            [0, config.pointerTailLength],
                            [config.pointerWidth / 2, 0] ];
            let pointerLine = d3.line();
            let pg = self.svg.append('g').data([lineData])
                    .attr('class', 'pointer')
                    .attr('transform', centerTx);

            pointer = pg.append('path')
                .attr('d', pointerLine/*function(d) { return pointerLine(d) +'Z';}*/ )
                .attr('transform', 'rotate(' + config.minAngle + ')');

            update(newValue === undefined ? 0 : newValue);
        }

        function update(newValue) {
            let ratio = scale(newValue);
            let newAngle = config.minAngle + (ratio * range);

            pointer.transition()
                .duration(config.transitionMs)
                .ease(d3.easeElastic)
                .attr('transform', 'rotate(' + newAngle + ')');
        }

        configure();
        render(undefined);
        update(Math.min(this.siegeLevel, 100));
    }
}