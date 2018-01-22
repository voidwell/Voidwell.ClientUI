"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var collections_1 = require("@angular/cdk/collections");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/of");
var PlanetsideAlertMapComponent = (function () {
    function PlanetsideAlertMapComponent(injector) {
        this.injector = injector;
    }
    PlanetsideAlertMapComponent.prototype.ngOnInit = function () {
        var _this = this;
        var inj = this.injector;
        var combatEvent = inj.view.viewContainerParent.component;
        combatEvent.event.subscribe(function (alert) {
            if (alert == null) {
                return;
            }
            _this.dataSource = new TableDataSource(alert.log.captureLog);
        });
    };
    return PlanetsideAlertMapComponent;
}());
PlanetsideAlertMapComponent = __decorate([
    core_1.Component({
        templateUrl: './planetside-alert-map.template.html',
        styleUrls: ['./planetside-alert-map.styles.css']
    }),
    __metadata("design:paramtypes", [core_1.Injector])
], PlanetsideAlertMapComponent);
exports.PlanetsideAlertMapComponent = PlanetsideAlertMapComponent;
var TableDataSource = (function (_super) {
    __extends(TableDataSource, _super);
    function TableDataSource(data) {
        var _this = _super.call(this) || this;
        _this.data = data;
        return _this;
    }
    TableDataSource.prototype.connect = function () {
        var _this = this;
        var first = Observable_1.Observable.of(this.data);
        return first.map(function () {
            var data = _this.data.slice();
            return data;
        });
    };
    TableDataSource.prototype.disconnect = function () { };
    return TableDataSource;
}(collections_1.DataSource));
exports.TableDataSource = TableDataSource;
