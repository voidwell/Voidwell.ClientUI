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
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/of");
require("rxjs/add/operator/timeout");
require("rxjs/add/operator/catch");
require("rxjs/add/observable/throw");
var http_1 = require("@angular/http");
var store_1 = require("@angular-redux/store");
var core_1 = require("@angular/core");
var PlanetsideApi = (function () {
    function PlanetsideApi(http, ngRedux) {
        this.http = http;
        this.ngRedux = ngRedux;
        this.ps2Url = location.origin + '/api/ps2/';
    }
    PlanetsideApi.prototype.getNews = function () {
        var _this = this;
        return this.http.get(this.ps2Url + 'feeds/news')
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return Observable_1.Observable.throw(error);
        });
    };
    PlanetsideApi.prototype.getUpdates = function () {
        var _this = this;
        return this.http.get(this.ps2Url + 'feeds/updates')
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return Observable_1.Observable.throw(error);
        });
    };
    PlanetsideApi.prototype.search = function (query) {
        var _this = this;
        return this.http.get(this.ps2Url + 'search/' + query)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return Observable_1.Observable.throw(error);
        });
    };
    PlanetsideApi.prototype.getWeaponInfo = function (itemId) {
        var _this = this;
        return this.http.get(this.ps2Url + 'weaponinfo/' + itemId)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return Observable_1.Observable.throw(error);
        });
    };
    PlanetsideApi.prototype.getCharacter = function (characterId) {
        var _this = this;
        return this.http.get(this.ps2Url + 'character/' + characterId)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return Observable_1.Observable.throw(error);
        });
    };
    PlanetsideApi.prototype.getCharacterSessions = function (characterId) {
        var _this = this;
        return this.http.get(this.ps2Url + 'character/' + characterId + '/sessions')
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return Observable_1.Observable.throw(error);
        });
    };
    PlanetsideApi.prototype.getCharacterSession = function (characterId, sessionId) {
        var _this = this;
        return this.http.get(this.ps2Url + 'character/' + characterId + '/sessions/' + sessionId)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return Observable_1.Observable.throw(error);
        });
    };
    PlanetsideApi.prototype.getAllProfiles = function () {
        var _this = this;
        return this.http.get(this.ps2Url + 'profile')
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return Observable_1.Observable.throw(error);
        });
    };
    PlanetsideApi.prototype.getAllVehicles = function () {
        var _this = this;
        return this.http.get(this.ps2Url + 'vehicle')
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return Observable_1.Observable.throw(error);
        });
    };
    PlanetsideApi.prototype.getOutfit = function (outfitId) {
        var _this = this;
        return this.http.get(this.ps2Url + 'outfit/' + outfitId)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return Observable_1.Observable.throw(error);
        });
    };
    PlanetsideApi.prototype.getOutfitMembers = function (outfitId) {
        var _this = this;
        return this.http.get(this.ps2Url + 'outfit/' + outfitId + '/members')
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return Observable_1.Observable.throw(error);
        });
    };
    PlanetsideApi.prototype.getAllAlerts = function () {
        var _this = this;
        return this.http.get(this.ps2Url + 'alert')
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return Observable_1.Observable.throw(error);
        });
    };
    PlanetsideApi.prototype.getAllAlertsByWorldId = function (worldId) {
        var _this = this;
        return this.http.get(this.ps2Url + 'alert/' + worldId)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return Observable_1.Observable.throw(error);
        });
    };
    PlanetsideApi.prototype.getAlert = function (worldId, alertId) {
        var _this = this;
        return this.http.get(this.ps2Url + 'alert/' + worldId + '/' + alertId)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return Observable_1.Observable.throw(error);
        });
    };
    return PlanetsideApi;
}());
PlanetsideApi = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http, store_1.NgRedux])
], PlanetsideApi);
exports.PlanetsideApi = PlanetsideApi;
