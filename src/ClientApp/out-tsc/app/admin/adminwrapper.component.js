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
var store_1 = require("@angular-redux/store");
var voidwell_auth_service_1 = require("./../shared/services/voidwell-auth.service");
var AdminWrapperComponent = (function () {
    function AdminWrapperComponent(auth, ngRedux) {
        var _this = this;
        this.auth = auth;
        this.ngRedux = ngRedux;
        this.navLinks = [
            { path: 'dashboard', label: 'Dashboard', roles: null },
            { path: 'events', label: 'Events', roles: ['Administrator', 'SuperAdmin', 'Events'] },
            { path: 'blog', label: 'Blog', roles: ['Administrator', 'SuperAdmin', 'Blog'] },
            { path: 'users', label: 'Users', roles: ['Administrator', 'SuperAdmin'] },
            { path: 'roles', label: 'Roles', roles: ['Administrator', 'SuperAdmin'] }
        ];
        this.userState = this.ngRedux.select('loggedInUser');
        this.userState.subscribe(function (user) {
            if (user) {
                if (user.roles) {
                    _this.userRoles = user.roles || [];
                }
            }
        });
    }
    AdminWrapperComponent.prototype.getNavLinks = function () {
        var permittedLinks = [];
        for (var i = 0; i < this.navLinks.length; i++) {
            if (this.navLinks[i].roles == null || this.hasRoles(this.navLinks[i].roles)) {
                permittedLinks.push(this.navLinks[i]);
            }
        }
        return permittedLinks;
    };
    AdminWrapperComponent.prototype.hasRoles = function (roles) {
        if (!roles) {
            return true;
        }
        for (var i = 0; i < roles.length; i++) {
            if (this.hasRole(roles[i])) {
                return true;
            }
        }
        return false;
    };
    AdminWrapperComponent.prototype.hasRole = function (role) {
        if (this.userRoles && this.userRoles.indexOf(role) > -1) {
            return true;
        }
        return false;
    };
    return AdminWrapperComponent;
}());
AdminWrapperComponent = __decorate([
    core_1.Component({
        selector: 'voidwell-admin-wrapper',
        templateUrl: './adminwrapper.template.html',
        styleUrls: ['../app.styles.css']
    }),
    __metadata("design:paramtypes", [voidwell_auth_service_1.VoidwellAuthService, store_1.NgRedux])
], AdminWrapperComponent);
exports.AdminWrapperComponent = AdminWrapperComponent;
