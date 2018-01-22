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
var voidwell_api_service_1 = require("../shared/services/voidwell-api.service");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/operator/catch");
require("rxjs/add/operator/finally");
require("rxjs/add/observable/throw");
var RolesComponent = (function () {
    function RolesComponent(api) {
        this.api = api;
        this.errorMessage = null;
    }
    RolesComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.isLoading = true;
        this.getRolesRequest = this.api.getAllRoles()
            .subscribe(function (roles) {
            _this.roles = roles;
            _this.isLoading = false;
        });
    };
    RolesComponent.prototype.addRole = function (roleName) {
        var _this = this;
        this.errorMessage = null;
        this.isLoading = true;
        this.api.addRole(roleName)
            .catch(function (error) {
            try {
                _this.errorMessage = JSON.parse(error._body);
            }
            catch (ex) {
                _this.errorMessage = error._body;
            }
            return Observable_1.Observable.throw(error);
        })
            .finally(function () {
            _this.isLoading = false;
        })
            .subscribe(function (role) {
            _this.roles.push(role);
        });
    };
    RolesComponent.prototype.deleteRole = function (role) {
        var _this = this;
        this.errorMessage = null;
        this.isLoading = true;
        this.api.deleteRole(role.id)
            .catch(function (error) {
            try {
                _this.errorMessage = JSON.parse(error._body);
            }
            catch (ex) {
                _this.errorMessage = error._body;
            }
            return Observable_1.Observable.throw(error);
        })
            .finally(function () {
            _this.isLoading = false;
        })
            .subscribe(function (result) {
            var idx = _this.roles.indexOf(role);
            _this.roles.splice(idx, 1);
        });
    };
    RolesComponent.prototype.getDetails = function (role) {
        /*
        role.isLoading = true;
        this.api.getUsersInRole(role.name).subscribe(users => {
            role.isLoading = false;
            role.users = users;
        });;
        */
    };
    RolesComponent.prototype.ngOnDestroy = function () {
        if (this.getRolesRequest) {
            this.getRolesRequest.unsubscribe();
        }
    };
    return RolesComponent;
}());
RolesComponent = __decorate([
    core_1.Component({
        selector: 'voidwell-admin-roles',
        templateUrl: './roles.template.html',
        styleUrls: ['../app.styles.css'],
        providers: [voidwell_api_service_1.VoidwellApi]
    }),
    __metadata("design:paramtypes", [voidwell_api_service_1.VoidwellApi])
], RolesComponent);
exports.RolesComponent = RolesComponent;
