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
var planetside_api_service_1 = require("./../../planetside-api.service");
var PlanetsideAlertsListComponent = (function () {
    function PlanetsideAlertsListComponent(api) {
        var _this = this;
        this.api = api;
        this.errorMessage = null;
        this.activeAlerts = [];
        this.pastAlerts = [];
        this.isLoading = true;
        this.activeAlerts = [];
        this.pastAlerts = [];
        this.api.getAllAlerts()
            .subscribe(function (alerts) {
            for (var i = 0; i < alerts.length; i++) {
                if (alerts[i].endDate) {
                    _this.pastAlerts.push(alerts[i]);
                }
                else {
                    _this.activeAlerts.push(alerts[i]);
                }
            }
            _this.isLoading = false;
        });
    }
    PlanetsideAlertsListComponent.prototype.getEndDate = function (alert) {
        var startString = alert.startDate;
        var startMs = new Date(startString).getTime();
        return new Date(startMs + 1000 * 60 * 90);
    };
    return PlanetsideAlertsListComponent;
}());
PlanetsideAlertsListComponent = __decorate([
    core_1.Component({
        templateUrl: './planetside-alerts-list.template.html',
        styleUrls: ['./planetside-alerts-list.styles.css'],
        providers: [planetside_api_service_1.PlanetsideApi]
    }),
    __metadata("design:paramtypes", [planetside_api_service_1.PlanetsideApi])
], PlanetsideAlertsListComponent);
exports.PlanetsideAlertsListComponent = PlanetsideAlertsListComponent;
