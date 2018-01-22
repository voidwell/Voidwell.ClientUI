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
var router_1 = require("@angular/router");
var collections_1 = require("@angular/cdk/collections");
var material_1 = require("@angular/material");
var common_1 = require("@angular/common");
var planetside_api_service_1 = require("./../planetside-api.service");
var header_service_1 = require("./../../shared/services/header.service");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/operator/catch");
require("rxjs/add/operator/finally");
require("rxjs/add/observable/throw");
var PlanetsideOutfitComponent = (function () {
    function PlanetsideOutfitComponent(api, route, router, headerService, datePipe) {
        var _this = this;
        this.api = api;
        this.route = route;
        this.router = router;
        this.headerService = headerService;
        this.datePipe = datePipe;
        this.errorMessage = null;
        this.outfitData = null;
        this.sort = new material_1.MatSort();
        this.routeSub = this.route.params.subscribe(function (params) {
            var id = params['id'];
            _this.isLoading = true;
            _this.isLoadingMembers = true;
            _this.errorMessage = null;
            _this.api.getOutfit(id)
                .catch(function (error) {
                _this.errorMessage = error._body;
                return Observable_1.Observable.throw(error);
            })
                .finally(function () {
                _this.isLoading = false;
            })
                .subscribe(function (data) {
                _this.outfitData = data;
                var alias = data.alias ? '[' + data.alias + '] ' : '';
                _this.headerService.activeHeader.title = alias + data.name;
                _this.headerService.activeHeader.subtitle = data.worldName;
                if (data.factionId === '1') {
                    _this.headerService.activeHeader.background = '#321147';
                }
                else if (data.factionId === '2') {
                    _this.headerService.activeHeader.background = '#112447';
                }
                else if (data.factionId === '3') {
                    _this.headerService.activeHeader.background = '#471111';
                }
                var createdDate = _this.datePipe.transform(data.createdDate, 'MMM d, y');
                _this.headerService.activeHeader.info = [
                    { label: 'Members', value: data.memberCount },
                    { label: 'Created', value: createdDate },
                    { label: 'Leader', value: data.leaderName },
                ];
            });
            _this.api.getOutfitMembers(id)
                .catch(function (error) {
                _this.errorMessage = error._body;
                return Observable_1.Observable.throw(error);
            })
                .finally(function () {
                _this.isLoadingMembers = false;
            })
                .subscribe(function (data) {
                _this.members = data;
                _this.sort.sort({
                    id: 'rank',
                    start: 'desc'
                });
                _this.dataSource = new TableDataSource(data, _this.sort);
            });
        });
    }
    PlanetsideOutfitComponent.prototype.ngOnDestroy = function () {
        this.routeSub.unsubscribe();
        this.headerService.reset();
    };
    return PlanetsideOutfitComponent;
}());
PlanetsideOutfitComponent = __decorate([
    core_1.Component({
        selector: 'planetside-outfit',
        templateUrl: './planetside-outfit.template.html',
        styleUrls: ['./planetside-outfit.styles.css'],
        providers: [planetside_api_service_1.PlanetsideApi]
    }),
    __metadata("design:paramtypes", [planetside_api_service_1.PlanetsideApi, router_1.ActivatedRoute, router_1.Router, header_service_1.HeaderService, common_1.DatePipe])
], PlanetsideOutfitComponent);
exports.PlanetsideOutfitComponent = PlanetsideOutfitComponent;
var TableDataSource = (function (_super) {
    __extends(TableDataSource, _super);
    function TableDataSource(data, sort) {
        var _this = _super.call(this) || this;
        _this.data = data;
        _this.sort = sort;
        return _this;
    }
    TableDataSource.prototype.connect = function () {
        var _this = this;
        var first = Observable_1.Observable.of(this.data);
        return Observable_1.Observable.merge(first, this.sort.sortChange).map(function () {
            return _this.getSortedData();
        });
    };
    TableDataSource.prototype.getSortedData = function () {
        var _this = this;
        var data = this.data;
        if (!this.sort.active || this.sort.direction == '') {
            return data;
        }
        return data.sort(function (a, b) {
            var propertyA;
            var propertyB;
            switch (_this.sort.active) {
                case 'rank':
                    _a = [a.rankOrdinal, b.rankOrdinal], propertyA = _a[0], propertyB = _a[1];
                    break;
            }
            var valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            var valueB = isNaN(+propertyB) ? propertyB : +propertyB;
            return (valueA < valueB ? -1 : 1) * (_this.sort.direction == 'asc' ? 1 : -1);
            var _a;
        });
    };
    TableDataSource.prototype.disconnect = function () { };
    return TableDataSource;
}(collections_1.DataSource));
exports.TableDataSource = TableDataSource;
