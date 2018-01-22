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
var planetside_player_component_1 = require("./../../planetside-player.component");
var planetside_api_service_1 = require("./../../../planetside-api.service");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/operator/catch");
require("rxjs/add/operator/finally");
require("rxjs/add/observable/throw");
var PlanetsidePlayerSessionsListComponent = (function () {
    function PlanetsidePlayerSessionsListComponent(planetsidePlayer, api) {
        var _this = this;
        this.planetsidePlayer = planetsidePlayer;
        this.api = api;
        this.errorMessage = null;
        this.isLoading = true;
        this.planetsidePlayer.playerData.subscribe(function (data) {
            _this.isLoading = true;
            _this.errorMessage = null;
            _this.sessions = [];
            _this.playerData = data;
            if (_this.playerData !== null) {
                _this.api.getCharacterSessions(_this.playerData.id)
                    .catch(function (error) {
                    _this.errorMessage = error._body;
                    return Observable_1.Observable.throw(error);
                })
                    .finally(function () {
                    _this.isLoading = false;
                })
                    .subscribe(function (sessions) {
                    _this.sessions = sessions.sort(_this.sortSessions);
                    _this.dataSource = new SessionsDataSource(_this.sessions);
                });
            }
        });
    }
    PlanetsidePlayerSessionsListComponent.prototype.sortSessions = function (a, b) {
        if (a.stats.loginDate < b.stats.loginDate)
            return 1;
        if (a.stats.loginDate > b.stats.loginDate)
            return -1;
        return 0;
    };
    return PlanetsidePlayerSessionsListComponent;
}());
PlanetsidePlayerSessionsListComponent = __decorate([
    core_1.Component({
        templateUrl: './planetside-player-sessions-list.template.html',
        styleUrls: ['./planetside-player-sessions-list.styles.css']
    }),
    __metadata("design:paramtypes", [planetside_player_component_1.PlanetsidePlayerComponent, planetside_api_service_1.PlanetsideApi])
], PlanetsidePlayerSessionsListComponent);
exports.PlanetsidePlayerSessionsListComponent = PlanetsidePlayerSessionsListComponent;
var SessionsDataSource = (function (_super) {
    __extends(SessionsDataSource, _super);
    function SessionsDataSource(data) {
        var _this = _super.call(this) || this;
        _this.data = data;
        return _this;
    }
    SessionsDataSource.prototype.connect = function () {
        return Observable_1.Observable.of(this.data);
    };
    SessionsDataSource.prototype.disconnect = function () { };
    return SessionsDataSource;
}(collections_1.DataSource));
exports.SessionsDataSource = SessionsDataSource;
