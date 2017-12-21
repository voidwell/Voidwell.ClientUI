"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var d3_ng2_service_1 = require("d3-ng2-service");
var PlanetsidePlayerStatsSiegeCardComponent = (function () {
    function PlanetsidePlayerStatsSiegeCardComponent(element, d3Service) {
        this.d3 = d3Service.getD3();
    }
    PlanetsidePlayerStatsSiegeCardComponent.prototype.ngOnInit = function () {
        var d3 = this.d3;
        var gaugeElem = this.gaugeElement.nativeElement;
        this.siegeLevel = this.captured / this.defended * 100;
        var config = {
            size: 200,
            clipWidth: 200,
            clipHeight: 110,
            ringInset: 20,
            ringWidth: 30,
            pointerWidth: 5,
            pointerTailLength: 5,
            pointerHeadLengthPercent: 0.9,
            minValue: 0,
            maxValue: 100,
            minAngle: -90,
            maxAngle: 90,
            transitionMs: 4000,
            majorTicks: 500,
            textTicks: 10,
            labelFormat: d3.format(''),
            labelInset: 10,
            arcColorFn: d3.interpolateHsl(d3.rgb('#686e7d'), d3.rgb('#b11b1b'))
        };
        var range = undefined;
        var r = undefined;
        var pointerHeadLength = undefined;
        var svg = undefined;
        var arc = undefined;
        var scale = undefined;
        var ticks = undefined;
        var tickData = undefined;
        var pointer = undefined;
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
            tickData = d3.range(config.majorTicks).map(function () { return 1 / config.majorTicks; });
            arc = d3.arc()
                .innerRadius(r - config.ringWidth - config.ringInset)
                .outerRadius(r - config.ringInset)
                .startAngle(function (d, i) {
                var ratio = d * i;
                return deg2rad(config.minAngle + (ratio * range));
            })
                .endAngle(function (d, i) {
                var ratio = d * (i + 1);
                return deg2rad(config.minAngle + (ratio * range));
            });
        }
        function render(newValue) {
            svg = d3.select(gaugeElem)
                .append('svg:svg')
                .attr('width', config.clipWidth)
                .attr('height', config.clipHeight);
            var centerTx = centerTranslation();
            svg.append('g')
                .attr('transform', centerTx)
                .selectAll('path')
                .data(d3.range(500).map(function () { return 1 / 500; }))
                .enter().append('path')
                .attr('d', arc)
                .style('fill', function (d, i) { return config.arcColorFn(d * i); });
            var lg = svg.append('g')
                .attr('class', 'label')
                .attr('transform', centerTx);
            lg.selectAll('text')
                .data(ticks)
                .enter().append('text')
                .attr('transform', function (d) {
                var ratio = scale(d);
                var newAngle = config.minAngle + (ratio * range);
                return 'rotate(' + newAngle + ') translate(0,' + (config.labelInset - r) + ')';
            })
                .text(config.labelFormat);
            var lineData = [[config.pointerWidth / 2, 0],
                [0, -pointerHeadLength],
                [-(config.pointerWidth / 2), 0],
                [0, config.pointerTailLength],
                [config.pointerWidth / 2, 0]];
            var pointerLine = d3.line();
            var pg = svg.append('g').data([lineData])
                .attr('class', 'pointer')
                .attr('transform', centerTx);
            pointer = pg.append('path')
                .attr('d', pointerLine /*function(d) { return pointerLine(d) +'Z';}*/)
                .attr('transform', 'rotate(' + config.minAngle + ')');
            update(newValue === undefined ? 0 : newValue);
        }
        function update(newValue) {
            var ratio = scale(newValue);
            var newAngle = config.minAngle + (ratio * range);
            pointer.transition()
                .duration(config.transitionMs)
                .ease(d3.easeElastic)
                .attr('transform', 'rotate(' + newAngle + ')');
        }
        configure();
        render(undefined);
        update(Math.min(this.siegeLevel, 100));
    };
    return PlanetsidePlayerStatsSiegeCardComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], PlanetsidePlayerStatsSiegeCardComponent.prototype, "captured", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], PlanetsidePlayerStatsSiegeCardComponent.prototype, "defended", void 0);
__decorate([
    core_1.ViewChild('siegegauge'),
    __metadata("design:type", core_1.ElementRef)
], PlanetsidePlayerStatsSiegeCardComponent.prototype, "gaugeElement", void 0);
PlanetsidePlayerStatsSiegeCardComponent = __decorate([
    core_1.Component({
        selector: 'planetside-player-stats-siege-card',
        templateUrl: './planetside-player-stats-siege-card.template.html',
        styleUrls: ['./planetside-player-stats-siege-card.styles.css'],
        encapsulation: core_1.ViewEncapsulation.None
    }),
    __metadata("design:paramtypes", [core_1.ElementRef, d3_ng2_service_1.D3Service])
], PlanetsidePlayerStatsSiegeCardComponent);
exports.PlanetsidePlayerStatsSiegeCardComponent = PlanetsidePlayerStatsSiegeCardComponent;
