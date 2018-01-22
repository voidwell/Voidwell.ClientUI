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
var planetside_player_component_1 = require("./../../planetside-player.component");
var planetside_api_service_1 = require("./../../../planetside-api.service");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/operator/catch");
require("rxjs/add/operator/finally");
require("rxjs/add/observable/throw");
var PlanetsidePlayerSessionComponent = (function () {
    function PlanetsidePlayerSessionComponent(planetsidePlayer, api, route) {
        var _this = this;
        this.planetsidePlayer = planetsidePlayer;
        this.api = api;
        this.route = route;
        this.errorMessage = null;
        this.isLoading = true;
        this.dataSub = this.planetsidePlayer.playerData.subscribe(function (data) {
            _this.isLoading = true;
            _this.errorMessage = null;
            _this.session = null;
            _this.playerData = data;
            _this.sessionStats = {
                kills: 0,
                deaths: 0,
                teamkills: 0,
                suicides: 0,
                headshots: 0
            };
            _this.routeSub = _this.route.params.subscribe(function (params) {
                var sessionId = params['id'];
                if (_this.playerData !== null) {
                    _this.api.getCharacterSession(_this.playerData.id, sessionId)
                        .catch(function (error) {
                        _this.errorMessage = error._body;
                        return Observable_1.Observable.throw(error);
                    })
                        .finally(function () {
                        _this.isLoading = false;
                    })
                        .subscribe(function (data) {
                        _this.session = data.session;
                        _this.calculateSessionStats(data.events);
                        _this.dataSource = new SessionDataSource(data.events);
                    });
                }
            });
        });
    }
    PlanetsidePlayerSessionComponent.prototype.calculateSessionStats = function (events) {
        for (var i = 0; i < events.length; i++) {
            var event_1 = events[i];
            if (event_1.attacker.id === this.playerData.id &&
                event_1.attacker.id !== event_1.victim.id &&
                event_1.attacker.factionId !== event_1.victim.factionId) {
                this.sessionStats.kills++;
                if (event_1.isHeadshot) {
                    this.sessionStats.headshots++;
                }
            }
            if (event_1.attacker.id === this.playerData.id &&
                event_1.attacker.id !== event_1.victim.id &&
                event_1.attacker.factionId === event_1.victim.factionId) {
                this.sessionStats.teamkills++;
            }
            if (event_1.victim.id === this.playerData.id) {
                this.sessionStats.deaths++;
            }
            if (event_1.attacker.id === this.playerData.id &&
                event_1.attacker.id === event_1.victim.id) {
                this.sessionStats.suicides++;
            }
        }
    };
    PlanetsidePlayerSessionComponent.prototype.ngOnDestroy = function () {
        this.dataSub.unsubscribe();
        this.routeSub.unsubscribe();
    };
    return PlanetsidePlayerSessionComponent;
}());
PlanetsidePlayerSessionComponent = __decorate([
    core_1.Component({
        templateUrl: './planetside-player-session.template.html',
        styleUrls: ['./planetside-player-session.styles.css']
    }),
    __metadata("design:paramtypes", [planetside_player_component_1.PlanetsidePlayerComponent, planetside_api_service_1.PlanetsideApi, router_1.ActivatedRoute])
], PlanetsidePlayerSessionComponent);
exports.PlanetsidePlayerSessionComponent = PlanetsidePlayerSessionComponent;
var SessionDataSource = (function (_super) {
    __extends(SessionDataSource, _super);
    function SessionDataSource(data) {
        var _this = _super.call(this) || this;
        _this.data = data;
        return _this;
    }
    SessionDataSource.prototype.connect = function () {
        return Observable_1.Observable.of(this.data);
    };
    SessionDataSource.prototype.disconnect = function () { };
    return SessionDataSource;
}(collections_1.DataSource));
exports.SessionDataSource = SessionDataSource;
