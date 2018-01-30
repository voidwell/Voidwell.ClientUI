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
var voidwell_api_service_1 = require("../../../shared/services/voidwell-api.service");
var ChangePasswordComponent = (function () {
    function ChangePasswordComponent(api) {
        this.api = api;
        this.isLoading = false;
        this.errorMessage = null;
    }
    ChangePasswordComponent.prototype.onSubmitChangePassword = function (passwordChangeForm) {
        var _this = this;
        if (passwordChangeForm.valid) {
            this.isLoading = true;
            this.errorMessage = null;
            this.api.changePassword(passwordChangeForm.value)
                .subscribe(function (success) {
                passwordChangeForm.reset();
                _this.isLoading = false;
            }, function (error) {
                _this.errorMessage = error._body;
                _this.isLoading = false;
            });
        }
    };
    return ChangePasswordComponent;
}());
ChangePasswordComponent = __decorate([
    core_1.Component({
        templateUrl: './change-password.template.html'
    }),
    __metadata("design:paramtypes", [voidwell_api_service_1.VoidwellApi])
], ChangePasswordComponent);
exports.ChangePasswordComponent = ChangePasswordComponent;
