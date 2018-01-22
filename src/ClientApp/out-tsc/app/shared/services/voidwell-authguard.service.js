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
var router_1 = require("@angular/router");
var store_1 = require("@angular-redux/store");
var voidwell_api_service_1 = require("./voidwell-api.service");
var Observable_1 = require("rxjs/Observable");
var voidwell_auth_service_1 = require("./voidwell-auth.service");
var VoidwellAuthGuard = (function () {
    function VoidwellAuthGuard(ngRedux, router, api, authService) {
        this.ngRedux = ngRedux;
        this.router = router;
        this.api = api;
        this.authService = authService;
    }
    VoidwellAuthGuard.prototype.canActivate = function (route, state) {
        var guestOnly = route.data['guestOnly'];
        if (guestOnly) {
            if (this.ngRedux.getState().loggedInUser && this.ngRedux.getState().loggedInUser.isLoggedIn) {
                return Observable_1.Observable.of(false);
            }
            return Observable_1.Observable.of(true);
        }
        var roles = route.data['roles'];
        if (this.ngRedux.getState().loggedInUser && this.ngRedux.getState().loggedInUser.isLoggedIn) {
            if (roles) {
                return this.authService.hasRoles(roles);
            }
            return Observable_1.Observable.of(true);
        }
        return Observable_1.Observable.of(false);
    };
    return VoidwellAuthGuard;
}());
VoidwellAuthGuard = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [store_1.NgRedux, router_1.Router, voidwell_api_service_1.VoidwellApi,
        voidwell_auth_service_1.VoidwellAuthService])
], VoidwellAuthGuard);
exports.VoidwellAuthGuard = VoidwellAuthGuard;
