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
var router_1 = require("@angular/router");
var planetside_player_component_1 = require("./../planetside-player.component");
var planetside_api_service_1 = require("./../../planetside-api.service");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/of");
var PlanetsidePlayerVehiclesComponent = (function () {
    function PlanetsidePlayerVehiclesComponent(planetsidePlayer, api, route) {
        var _this = this;
        this.planetsidePlayer = planetsidePlayer;
        this.api = api;
        this.route = route;
        this.vehicle = null;
        this.vehicleWeapons = [];
        this.allVehicles = [];
        this.isLoading = true;
        this.api.getAllVehicles().subscribe(function (vehicles) {
            planetsidePlayer.playerData.subscribe(function (data) {
                if (data !== null) {
                    _this.playerData = data;
                    _this.filterVehicles(vehicles);
                    if (_this.vehicleId) {
                        _this.setupVehicle(_this.vehicleId);
                    }
                }
            });
            _this.isLoading = false;
        });
        this.routeSub = this.route.params.subscribe(function (params) {
            _this.vehicle = null;
            _this.vehicleWeapons = [];
            _this.vehicleId = params['id'];
            if (!_this.isLoading && _this.vehicleId) {
                _this.setupVehicle(_this.vehicleId);
            }
        });
    }
    PlanetsidePlayerVehiclesComponent.prototype.filterVehicles = function (data) {
        var vehicles = [];
        for (var i = 0; i < data.length; i++) {
            var vehicle = data[i];
            if (vehicle.factions.indexOf(this.playerData.factionId) !== -1 && vehicle.id < 100 && vehicle.id !== '13') {
                vehicles.push(vehicle);
            }
        }
        this.playerData.vehicleStats.forEach(function (d) {
            for (var i = 0; i < vehicles.length; i++) {
                if (vehicles[i].id === d.vehicleId) {
                    vehicles[i].stats = d;
                    break;
                }
            }
        });
        for (var k = 0; k < vehicles.length; k++) {
            if (vehicles[k].id === this.vehicleId) {
                this.vehicle = vehicles[k];
                break;
            }
        }
        this.vehicles = vehicles.sort(this.sortVehicles);
        this.vehiclesDataSource = new VehiclesDataSource(this.vehicles);
    };
    PlanetsidePlayerVehiclesComponent.prototype.setupVehicle = function (vehicleId) {
        for (var w = 0; w < this.playerData.weaponStats.length; w++) {
            var weapon = this.playerData.weaponStats[w];
            if (weapon.vehicleId === this.vehicleId) {
                this.vehicleWeapons.push(weapon);
            }
        }
    };
    PlanetsidePlayerVehiclesComponent.prototype.sortVehicles = function (a, b) {
        if (a.stats.score < b.stats.score)
            return 1;
        if (a.stats.score > b.stats.score)
            return -1;
        return 0;
    };
    PlanetsidePlayerVehiclesComponent.prototype.ngOnDestroy = function () {
        this.routeSub.unsubscribe();
    };
    return PlanetsidePlayerVehiclesComponent;
}());
PlanetsidePlayerVehiclesComponent = __decorate([
    core_1.Component({
        templateUrl: './planetside-player-vehicles.template.html',
        styleUrls: ['./planetside-player-vehicles.styles.css']
    }),
    __metadata("design:paramtypes", [planetside_player_component_1.PlanetsidePlayerComponent, planetside_api_service_1.PlanetsideApi, router_1.ActivatedRoute])
], PlanetsidePlayerVehiclesComponent);
exports.PlanetsidePlayerVehiclesComponent = PlanetsidePlayerVehiclesComponent;
var VehiclesDataSource = (function (_super) {
    __extends(VehiclesDataSource, _super);
    function VehiclesDataSource(data) {
        var _this = _super.call(this) || this;
        _this.data = data;
        return _this;
    }
    VehiclesDataSource.prototype.connect = function () {
        return Observable_1.Observable.of(this.data);
    };
    VehiclesDataSource.prototype.disconnect = function () { };
    return VehiclesDataSource;
}(collections_1.DataSource));
exports.VehiclesDataSource = VehiclesDataSource;
