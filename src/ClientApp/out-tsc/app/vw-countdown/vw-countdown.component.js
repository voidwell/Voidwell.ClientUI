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
var Rx_1 = require("rxjs/Rx");
var VWCountdownComponent = (function () {
    function VWCountdownComponent() {
    }
    VWCountdownComponent.prototype.hms = function () {
        var t = this.diff;
        if (t < 0) {
            return '0 Hours 0 Minutes 0 Seconds';
        }
        var hours = Math.floor(t / 3600);
        t -= hours * 3600;
        var minutes = Math.floor(t / 60) % 60;
        t -= minutes * 60;
        var seconds = t % 60;
        return [hours + ' Hours', minutes + ' Minutes', seconds + ' Seconds'].join(' ');
    };
    VWCountdownComponent.prototype.tock = function () {
        this.diff = Math.floor((this.end.getTime() - new Date().getTime()) / 1000);
    };
    VWCountdownComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.tock();
        this.remaining = this.hms();
        var tick = Rx_1.Observable.interval(1000).map(function (x) {
            _this.tock();
        }).subscribe(function (x) {
            _this.remaining = _this.hms();
            if (_this.diff < 0) {
                tick.unsubscribe();
            }
        });
    };
    return VWCountdownComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Date)
], VWCountdownComponent.prototype, "end", void 0);
VWCountdownComponent = __decorate([
    core_1.Component({
        selector: 'vw-countdown',
        template: '<span>{{remaining}}</span>'
    })
], VWCountdownComponent);
exports.VWCountdownComponent = VWCountdownComponent;
