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
require("rxjs/add/operator/catch");
require("rxjs/add/operator/finally");
require("rxjs/add/observable/throw");
var voidwell_api_service_1 = require("../shared/services/voidwell-api.service");
var UsersComponent = (function () {
    function UsersComponent(api) {
        this.api = api;
        this.errorMessage = null;
        this.isLoading = false;
        this.isLoadingUsers = false;
        this.isLoadingRoles = false;
    }
    UsersComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.isLoadingUsers = true;
        this.getUsersRequest = this.api.getUsers()
            .subscribe(function (users) {
            _this.users = users.sort(_this.usersSort);
            _this.isLoadingUsers = false;
            _this.updateLoading();
        });
        this.isLoadingRoles = true;
        this.getRolesRequest = this.api.getAllRoles()
            .subscribe(function (roles) {
            _this.roles = roles;
            _this.isLoadingRoles = false;
            _this.updateLoading();
        });
        this.updateLoading();
    };
    UsersComponent.prototype.getDetails = function (user) {
        this.errorMessage = null;
        user.isLoading = true;
        this.api.getUser(user.id).subscribe(function (userDetails) {
            user.isLoading = false;
            Object.assign(user, userDetails);
        });
        ;
    };
    UsersComponent.prototype.deleteUser = function (user) {
        var _this = this;
        this.errorMessage = null;
        user.isLocked = true;
        this.api.deleteUser(user.id).subscribe(function (users) {
            user.isLocked = false;
            var idx = _this.users.indexOf(user);
            _this.users.splice(idx, 1);
        });
        ;
    };
    UsersComponent.prototype.disableUser = function (user) {
        this.errorMessage = null;
        user.isLocked = true;
        user.isLocked = false;
    };
    UsersComponent.prototype.resetPassword = function (user) {
        this.errorMessage = null;
        user.isLocked = true;
        user.isLocked = false;
    };
    UsersComponent.prototype.setRoles = function (user, userRolesForm) {
        var _this = this;
        if (userRolesForm.pristine) {
            return;
        }
        this.errorMessage = null;
        user.isLocked = true;
        this.api.updateUserRoles(user.id, userRolesForm.value)
            .catch(function (error) {
            _this.errorMessage = error._body;
            userRolesForm.form.patchValue(user);
            return Observable_1.Observable.throw(error);
        })
            .finally(function () {
            user.isLocked = false;
            userRolesForm.form.markAsPristine();
        })
            .subscribe(function (updatedRoles) {
            user.roles = updatedRoles;
        });
    };
    UsersComponent.prototype.updateLoading = function () {
        this.isLoading = this.isLoadingRoles || this.isLoadingUsers;
    };
    UsersComponent.prototype.usersSort = function (a, b) {
        if (a.userName > b.userName)
            return true;
        return false;
    };
    UsersComponent.prototype.ngOnDestroy = function () {
        if (this.getUsersRequest) {
            this.getUsersRequest.unsubscribe();
        }
        if (this.getRolesRequest) {
            this.getRolesRequest.unsubscribe();
        }
    };
    return UsersComponent;
}());
UsersComponent = __decorate([
    core_1.Component({
        selector: 'voidwell-admin-users',
        templateUrl: './users.template.html',
        styleUrls: ['users.styles.css'],
        providers: [voidwell_api_service_1.VoidwellApi]
    }),
    __metadata("design:paramtypes", [voidwell_api_service_1.VoidwellApi])
], UsersComponent);
exports.UsersComponent = UsersComponent;
