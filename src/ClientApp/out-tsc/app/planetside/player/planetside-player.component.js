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
var common_1 = require("@angular/common");
var planetside_api_service_1 = require("./../planetside-api.service");
var header_service_1 = require("./../../shared/services/header.service");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/throw");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var PlanetsidePlayerComponent = (function () {
    function PlanetsidePlayerComponent(api, route, router, headerService, decimalPipe) {
        var _this = this;
        this.api = api;
        this.route = route;
        this.router = router;
        this.headerService = headerService;
        this.decimalPipe = decimalPipe;
        this.errorMessage = null;
        this.navLinks = [
            { path: 'stats', label: 'Stats' },
            { path: 'classes', label: 'Classes' },
            { path: 'vehicles', label: 'Vehicles' },
            { path: 'weapons', label: 'Weapons' },
            { path: 'sessions', label: 'Sessions' },
        ];
        this.playerData = new BehaviorSubject_1.BehaviorSubject(null);
        this.routeSub = this.route.params.subscribe(function (params) {
            var id = params['id'];
            _this.isLoading = true;
            _this.errorMessage = null;
            _this.playerData.next(null);
            _this.api.getCharacter(id)
                .catch(function (error) {
                _this.errorMessage = error._body;
                _this.isLoading = false;
                return Observable_1.Observable.throw(error);
            })
                .subscribe(function (data) {
                _this.playerData.next(data);
                _this.headerService.activeHeader.title = data.name;
                _this.headerService.activeHeader.subtitle = data.world;
                if (data.factionId === '1') {
                    _this.headerService.activeHeader.background = '#321147';
                }
                else if (data.factionId === '2') {
                    _this.headerService.activeHeader.background = '#112447';
                }
                else if (data.factionId === '3') {
                    _this.headerService.activeHeader.background = '#471111';
                }
                _this.headerService.activeHeader.info = [
                    { label: 'Battle Rank', value: data.battleRank },
                    { label: 'Score', value: _this.decimalPipe.transform(data.lifetimeStats.score) },
                    { label: 'Kills', value: _this.decimalPipe.transform(data.lifetimeStats.kills) },
                    { label: 'Deaths', value: _this.decimalPipe.transform(data.lifetimeStats.deaths) },
                    { label: 'Hours Played', value: _this.decimalPipe.transform(data.lifetimeStats.playTime / 3600, '.1-1') },
                ];
                _this.isLoading = false;
            });
        });
    }
    PlanetsidePlayerComponent.prototype.ngOnDestroy = function () {
        this.playerData.unsubscribe();
        this.routeSub.unsubscribe();
        this.headerService.reset();
    };
    return PlanetsidePlayerComponent;
}());
PlanetsidePlayerComponent = __decorate([
    core_1.Component({
        selector: 'planetside-player',
        templateUrl: './planetside-player.template.html',
        providers: [planetside_api_service_1.PlanetsideApi]
    }),
    __metadata("design:paramtypes", [planetside_api_service_1.PlanetsideApi, router_1.ActivatedRoute, router_1.Router, header_service_1.HeaderService, common_1.DecimalPipe])
], PlanetsidePlayerComponent);
exports.PlanetsidePlayerComponent = PlanetsidePlayerComponent;
