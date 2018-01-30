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
var header_service_1 = require("../shared/services/header.service");
var voidwell_auth_service_1 = require("../shared/services/voidwell-auth.service");
var store_1 = require("@angular-redux/store");
var VWNavbarComponent = (function () {
    function VWNavbarComponent(headerService, authService, ngRedux) {
        this.headerService = headerService;
        this.authService = authService;
        this.ngRedux = ngRedux;
        this.isLoggedIn = false;
    }
    VWNavbarComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.header = this.headerService.activeHeader;
        this.userState = this.ngRedux.select('loggedInUser');
        this.userState.subscribe(function (user) {
            if (user) {
                _this.isLoggedIn = user.isLoggedIn;
                if (user.user) {
                    _this.userName = user.user.profile.name || '';
                }
                if (user.roles) {
                    _this.userRoles = user.roles || [];
                }
            }
        });
    };
    VWNavbarComponent.prototype.signIn = function () {
        this.authService.signIn();
    };
    VWNavbarComponent.prototype.signOut = function () {
        this.authService.signOut();
    };
    VWNavbarComponent.prototype.hasRoles = function (roles) {
        if (roles == null) {
            return true;
        }
        for (var i = 0; i < roles.length; i++) {
            if (this.hasRole(roles[i])) {
                return true;
            }
        }
        return false;
    };
    VWNavbarComponent.prototype.hasRole = function (role) {
        if (this.userRoles && this.userRoles.indexOf(role) > -1) {
            return true;
        }
        return false;
    };
    return VWNavbarComponent;
}());
VWNavbarComponent = __decorate([
    core_1.Component({
        selector: 'vw-navbar',
        templateUrl: './vw-navbar.template.html',
        styleUrls: ['./vw-navbar.styles.css']
    }),
    __metadata("design:paramtypes", [header_service_1.HeaderService,
        voidwell_auth_service_1.VoidwellAuthService,
        store_1.NgRedux])
], VWNavbarComponent);
exports.VWNavbarComponent = VWNavbarComponent;
