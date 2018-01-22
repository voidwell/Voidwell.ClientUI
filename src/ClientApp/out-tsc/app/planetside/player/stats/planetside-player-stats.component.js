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
var planetside_player_component_1 = require("./../planetside-player.component");
var PlanetsidePlayerStatsComponent = (function () {
    function PlanetsidePlayerStatsComponent(planetsidePlayer) {
        var _this = this;
        this.planetsidePlayer = planetsidePlayer;
        planetsidePlayer.playerData.subscribe(function (data) {
            _this.playerData = data;
        });
    }
    return PlanetsidePlayerStatsComponent;
}());
PlanetsidePlayerStatsComponent = __decorate([
    core_1.Component({
        templateUrl: './planetside-player-stats.template.html',
        styleUrls: ['./planetside-player-stats.styles.css']
    }),
    __metadata("design:paramtypes", [planetside_player_component_1.PlanetsidePlayerComponent])
], PlanetsidePlayerStatsComponent);
exports.PlanetsidePlayerStatsComponent = PlanetsidePlayerStatsComponent;
