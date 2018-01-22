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
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/of");
var planetside_api_service_1 = require("./../planetside-api.service");
var PlanetsideNewsComponent = (function () {
    function PlanetsideNewsComponent(api) {
        var _this = this;
        this.api = api;
        this.errorMessage = null;
        this.errorMessage = null;
        this.isLoading = true;
        this.isNewsLoading = true;
        this.isUpdatesLoading = true;
        this.api.getNews()
            .catch(function (error) {
            _this.errorMessage = error._body;
            _this.isLoading = false;
            return Observable_1.Observable.of(error);
        })
            .subscribe(function (newsList) {
            _this.newsList = newsList;
            _this.isNewsLoading = false;
            _this.updateLoading();
        });
        this.api.getUpdates()
            .catch(function (error) {
            _this.errorMessage = error._body;
            _this.isLoading = false;
            return Observable_1.Observable.of(error);
        })
            .subscribe(function (updateList) {
            _this.updateList = updateList;
            _this.isUpdatesLoading = false;
            _this.updateLoading();
        });
    }
    PlanetsideNewsComponent.prototype.updateLoading = function () {
        this.isLoading = this.isNewsLoading && this.isUpdatesLoading;
    };
    return PlanetsideNewsComponent;
}());
PlanetsideNewsComponent = __decorate([
    core_1.Component({
        selector: 'planetside-news',
        templateUrl: './planetside-news.template.html',
        styleUrls: ['../../app.styles.css', './planetside-news.styles.css'],
        providers: [planetside_api_service_1.PlanetsideApi]
    }),
    __metadata("design:paramtypes", [planetside_api_service_1.PlanetsideApi])
], PlanetsideNewsComponent);
exports.PlanetsideNewsComponent = PlanetsideNewsComponent;
