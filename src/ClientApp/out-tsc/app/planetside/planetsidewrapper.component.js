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
var forms_1 = require("@angular/forms");
var router_1 = require("@angular/router");
var planetside_api_service_1 = require("./planetside-api.service");
var PlanetsideWrapperComponent = (function () {
    function PlanetsideWrapperComponent(api, router) {
        var _this = this;
        this.api = api;
        this.router = router;
        this.navLinks = [
            { path: 'news', label: 'News' },
            { path: 'alerts', label: 'Alerts' },
            { path: 'events', label: 'Events' }
        ];
        this.searchControl = new forms_1.FormControl();
        this.searchControl.valueChanges
            .subscribe(function (query) {
            _this.getSearchResults(query);
        });
    }
    PlanetsideWrapperComponent.prototype.onClickSearchResult = function (result) {
        if (result.type === 'character') {
            this.router.navigateByUrl('ps2/player/' + result.id);
        }
        if (result.type === 'outfit') {
            this.router.navigateByUrl('ps2/outfit/' + result.id);
        }
        if (result.type === 'item') {
            this.router.navigateByUrl('ps2/item/' + result.id);
        }
    };
    PlanetsideWrapperComponent.prototype.clearSearch = function () {
        if (this.searchControl.dirty) {
            this.searchControl.reset();
            this.results = [];
        }
    };
    PlanetsideWrapperComponent.prototype.getSearchResults = function (query) {
        var _this = this;
        clearTimeout(this.queryWait);
        if (!query || query.length === 0) {
            this.clearSearch();
        }
        if (!query || query.length < 2) {
            return;
        }
        this.queryWait = setTimeout(function () {
            _this.results = [];
            _this.api.search(query).subscribe(function (data) {
                _this.results = data;
            });
        }, 1000);
    };
    return PlanetsideWrapperComponent;
}());
PlanetsideWrapperComponent = __decorate([
    core_1.Component({
        selector: 'voidwell-planetside-wrapper',
        templateUrl: './planetsidewrapper.template.html',
        styleUrls: ['./planetsidewrapper.styles.css'],
        providers: [planetside_api_service_1.PlanetsideApi],
        encapsulation: core_1.ViewEncapsulation.None
    }),
    __metadata("design:paramtypes", [planetside_api_service_1.PlanetsideApi, router_1.Router])
], PlanetsideWrapperComponent);
exports.PlanetsideWrapperComponent = PlanetsideWrapperComponent;
