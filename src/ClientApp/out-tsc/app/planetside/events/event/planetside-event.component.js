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
var voidwell_api_service_1 = require("./../../../shared/services/voidwell-api.service");
var planetside_combat_event_component_1 = require("./../../combat-event/planetside-combat-event.component");
var PlanetsideEventComponent = (function (_super) {
    __extends(PlanetsideEventComponent, _super);
    function PlanetsideEventComponent(api, route, headerService) {
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
            var eventId = params['eventId'];
            _this.isLoading = true;
            _this.errorMessage = null;
            _this.activeEvent = null;
            _this.event.next(null);
            _this.api.getCustomEvent(eventId)
                .catch(function (error) {
                _this.errorMessage = error._body;
                _this.isLoading = false;
                return Observable_1.Observable.throw(error);
            })
                .subscribe(function (data) { return _this.setup(data); });
        });
        return _this;
    }
    PlanetsideEventComponent.prototype.setup = function (data) {
        this.headerService.activeHeader.title = data.name;
        this.headerService.activeHeader.subtitle = data.description;
        if (data.mapId === '2') {
            // Indar
            this.headerService.activeHeader.background = '#421c0a';
        }
        else if (data.mapId === '4') {
            // Hossin
            this.headerService.activeHeader.background = '#2a3f0d';
        }
        else if (data.mapId === '6') {
            // Amerish
            this.headerService.activeHeader.background = '#0a421c';
        }
        else if (data.mapId === '8') {
            // Esamir
            this.headerService.activeHeader.background = '#10393c';
        }
        else {
            this.headerService.activeHeader.background = '#1e282e';
        }
        this.event.next(data);
        this.activeEvent = data;
        this.isLoading = false;
    };
    PlanetsideEventComponent.prototype.getEndDate = function (alert) {
        var startString = alert.startDate;
        var startMs = new Date(startString).getTime();
        return new Date(startMs + 1000 * 60 * 90);
    };
    PlanetsideEventComponent.prototype.ngOnDestroy = function () {
        this.sub.unsubscribe();
        this.headerService.reset();
    };
    return PlanetsideEventComponent;
}(planetside_combat_event_component_1.PlanetsideCombatEventComponent));
PlanetsideEventComponent = __decorate([
    core_1.Component({
        templateUrl: './planetside-event.template.html',
        styleUrls: ['./planetside-event.styles.css']
    }),
    __metadata("design:paramtypes", [voidwell_api_service_1.VoidwellApi, router_1.ActivatedRoute, header_service_1.HeaderService])
], PlanetsideEventComponent);
exports.PlanetsideEventComponent = PlanetsideEventComponent;
