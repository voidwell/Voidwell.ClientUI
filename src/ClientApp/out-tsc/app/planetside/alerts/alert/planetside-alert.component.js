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
var header_service_1 = require("../../../shared/services/header.service");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/throw");
var planetside_api_service_1 = require("./../../planetside-api.service");
var planetside_combat_event_component_1 = require("./../../combat-event/planetside-combat-event.component");
var PlanetsideAlertComponent = (function (_super) {
    __extends(PlanetsideAlertComponent, _super);
    function PlanetsideAlertComponent(api, route, headerService) {
        var _this = _super.call(this) || this;
        _this.api = api;
        _this.route = route;
        _this.headerService = headerService;
        _this.isLoading = true;
        _this.errorMessage = null;
        _this.navLinks = [
            { path: 'players', label: 'Players' },
            { path: 'outfits', label: 'Outfits' },
            { path: 'weapons', label: 'Weapons' },
            { path: 'vehicles', label: 'Vehicles' },
            { path: 'map', label: 'Map' }
        ];
        _this.sub = _this.route.params.subscribe(function (params) {
            var worldId = params['worldId'];
            var instanceId = params['instanceId'];
            _this.isLoading = true;
            _this.errorMessage = null;
            _this.activeEvent = null;
            _this.event.next(null);
            _this.api.getAlert(worldId, instanceId)
                .catch(function (error) {
                _this.errorMessage = error._body;
                _this.isLoading = false;
                return Observable_1.Observable.throw(error);
            })
                .subscribe(function (data) { return _this.setup(data); });
        });
        return _this;
    }
    PlanetsideAlertComponent.prototype.setup = function (data) {
        this.headerService.activeHeader.title = data.metagameEvent.name;
        this.headerService.activeHeader.subtitle = data.metagameEvent.description;
        if (data.zoneId === '2') {
            // Indar
            this.headerService.activeHeader.background = '#421c0a';
        }
        else if (data.zoneId === '4') {
            // Hossin
            this.headerService.activeHeader.background = '#2a3f0d';
        }
        else if (data.zoneId === '6') {
            // Amerish
            this.headerService.activeHeader.background = '#0a421c';
        }
        else if (data.zoneId === '8') {
            // Esamir
            this.headerService.activeHeader.background = '#10393c';
        }
        else {
            this.headerService.activeHeader.background = '#1e282e';
        }
        this.event.next(data);
        console.log('alert');
        console.log(data);
        this.activeEvent = data;
        this.isLoading = false;
    };
    PlanetsideAlertComponent.prototype.getEndDate = function (alert) {
        var startString = alert.startDate;
        var startMs = new Date(startString).getTime();
        return new Date(startMs + 1000 * 60 * 90);
    };
    PlanetsideAlertComponent.prototype.ngOnDestroy = function () {
        this.sub.unsubscribe();
        this.headerService.reset();
    };
    return PlanetsideAlertComponent;
}(planetside_combat_event_component_1.PlanetsideCombatEventComponent));
PlanetsideAlertComponent = __decorate([
    core_1.Component({
        templateUrl: './planetside-alert.template.html',
        styleUrls: ['./planetside-alert.styles.css'],
        providers: [planetside_combat_event_component_1.PlanetsideCombatEventComponent]
    }),
    __metadata("design:paramtypes", [planetside_api_service_1.PlanetsideApi, router_1.ActivatedRoute, header_service_1.HeaderService])
], PlanetsideAlertComponent);
exports.PlanetsideAlertComponent = PlanetsideAlertComponent;
