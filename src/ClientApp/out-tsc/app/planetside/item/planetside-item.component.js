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
var router_1 = require("@angular/router");
var planetside_api_service_1 = require("./../planetside-api.service");
var header_service_1 = require("./../../shared/services/header.service");
var PlanetsideItemComponent = (function () {
    function PlanetsideItemComponent(api, route, headerService) {
        var _this = this;
        this.api = api;
        this.route = route;
        this.headerService = headerService;
        this.errorMessage = null;
        this.routeSub = this.route.params.subscribe(function (params) {
            var id = params['id'];
            _this.isLoading = true;
            _this.api.getWeaponInfo(id)
                .subscribe(function (data) {
                _this.weaponData = data;
                _this.headerService.activeHeader.title = data.name;
                _this.headerService.activeHeader.subtitle = data.category;
                if (data.factionId === '1') {
                    _this.headerService.activeHeader.background = '#321147';
                }
                else if (data.factionId === '2') {
                    _this.headerService.activeHeader.background = '#112447';
                }
                else if (data.factionId === '3') {
                    _this.headerService.activeHeader.background = '#471111';
                }
                _this.isLoading = false;
            });
        });
    }
    PlanetsideItemComponent.prototype.ngOnDestroy = function () {
        this.routeSub.unsubscribe();
        this.headerService.reset();
    };
    return PlanetsideItemComponent;
}());
PlanetsideItemComponent = __decorate([
    core_1.Component({
        selector: 'planetside-item',
        templateUrl: './planetside-item.template.html',
        styleUrls: ['./planetside-item.styles.css'],
        providers: [planetside_api_service_1.PlanetsideApi]
    }),
    __metadata("design:paramtypes", [planetside_api_service_1.PlanetsideApi, router_1.ActivatedRoute, header_service_1.HeaderService])
], PlanetsideItemComponent);
exports.PlanetsideItemComponent = PlanetsideItemComponent;
