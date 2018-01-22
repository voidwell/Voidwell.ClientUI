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
var material_1 = require("@angular/material");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/of");
require("rxjs/add/observable/merge");
var PlanetsideAlertWeaponsComponent = (function () {
    function PlanetsideAlertWeaponsComponent(injector) {
        this.injector = injector;
    }
    PlanetsideAlertWeaponsComponent.prototype.ngOnInit = function () {
        var _this = this;
        var inj = this.injector;
        var combatEvent = inj.view.viewContainerParent.component;
        combatEvent.event.subscribe(function (alert) {
            if (alert == null) {
                return;
            }
            _this.sort.sort({
                id: 'kills',
                start: 'desc'
            });
            _this.dataSource = new TableDataSource(alert.log.stats.weapons, _this.sort, _this.paginator);
        });
    };
    return PlanetsideAlertWeaponsComponent;
}());
__decorate([
    core_1.ViewChild(material_1.MatSort),
    __metadata("design:type", material_1.MatSort)
], PlanetsideAlertWeaponsComponent.prototype, "sort", void 0);
__decorate([
    core_1.ViewChild(material_1.MatPaginator),
    __metadata("design:type", material_1.MatPaginator)
], PlanetsideAlertWeaponsComponent.prototype, "paginator", void 0);
PlanetsideAlertWeaponsComponent = __decorate([
    core_1.Component({
        templateUrl: './planetside-alert-weapons.template.html',
        styleUrls: ['./planetside-alert-weapons.styles.css']
    }),
    __metadata("design:paramtypes", [core_1.Injector])
], PlanetsideAlertWeaponsComponent);
exports.PlanetsideAlertWeaponsComponent = PlanetsideAlertWeaponsComponent;
var TableDataSource = (function (_super) {
    __extends(TableDataSource, _super);
    function TableDataSource(data, sort, paginator) {
        var _this = _super.call(this) || this;
        _this.data = data;
        _this.sort = sort;
        _this.paginator = paginator;
        return _this;
    }
    TableDataSource.prototype.connect = function () {
        var _this = this;
        var first = Observable_1.Observable.of(this.data);
        return Observable_1.Observable.merge(first, this.sort.sortChange, this.paginator.page).map(function () {
            var data = _this.data.slice();
            var sortedData = _this.getSortedData(data);
            var startIndex = _this.paginator.pageIndex * _this.paginator.pageSize;
            return sortedData.splice(startIndex, _this.paginator.pageSize);
        });
    };
    TableDataSource.prototype.getSortedData = function (data) {
        var _this = this;
        if (!data) {
            return null;
        }
        if (!this.sort.active || this.sort.direction == '') {
            return data;
        }
        return data.sort(function (a, b) {
            var propertyA;
            var propertyB;
            switch (_this.sort.active) {
                case 'name':
                    _a = [a.item.name, b.item.name], propertyA = _a[0], propertyB = _a[1];
                    break;
                case 'kills':
                    _b = [a.kills, b.kills], propertyA = _b[0], propertyB = _b[1];
                    break;
                case 'tks':
                    _c = [a.teamkills, b.teamkills], propertyA = _c[0], propertyB = _c[1];
                    break;
                case 'headshots':
                    _d = [a.headshots, b.headshots], propertyA = _d[0], propertyB = _d[1];
                    break;
                case 'hsper':
                    _e = [(a.headshots / a.kills), (b.headshots / b.kills)], propertyA = _e[0], propertyB = _e[1];
                    break;
            }
            var valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            var valueB = isNaN(+propertyB) ? propertyB : +propertyB;
            return (valueA < valueB ? -1 : 1) * (_this.sort.direction == 'asc' ? 1 : -1);
            var _a, _b, _c, _d, _e;
        });
    };
    TableDataSource.prototype.disconnect = function () { };
    return TableDataSource;
}(collections_1.DataSource));
exports.TableDataSource = TableDataSource;