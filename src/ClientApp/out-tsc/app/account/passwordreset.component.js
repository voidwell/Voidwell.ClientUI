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
var PasswordResetComponent = (function () {
    function PasswordResetComponent(api) {
        this.api = api;
        this.isLoading = false;
        this.resetToken = null;
        this.resetSuccess = false;
        this.userEmail = null;
    }
    PasswordResetComponent.prototype.onSubmitResetStart = function (passwordResetStart) {
        var _this = this;
        if (passwordResetStart.valid) {
            this.isLoading = true;
            this.api.startResetPassword(passwordResetStart.value)
                .subscribe(function (result) {
                _this.userEmail = passwordResetStart.value.email;
                _this.securityQuestions = result.map(function (question) {
                    return {
                        question: question,
                        answer: ''
                    };
                });
                _this.isLoading = false;
            });
        }
    };
    PasswordResetComponent.prototype.onSubmitResetPasswordQuestions = function () {
        var _this = this;
        this.isLoading = true;
        var resetForm = {
            email: this.userEmail,
            questions: this.securityQuestions
        };
        this.api.resetPasswordQuestions(resetForm)
            .subscribe(function (result) {
            _this.resetToken = result;
            _this.securityQuestions = null;
            _this.isLoading = false;
        });
    };
    PasswordResetComponent.prototype.onSubmitChangePassword = function (passwordResetForm) {
        var _this = this;
        if (passwordResetForm.valid) {
            this.isLoading = true;
            var resetForm = Object.assign({}, passwordResetForm.value);
            resetForm.token = this.resetToken;
            resetForm.email = this.userEmail;
            this.api.resetPassword(resetForm)
                .subscribe(function (result) {
                _this.isLoading = false;
                _this.resetSuccess = true;
            });
        }
    };
    return PasswordResetComponent;
}());
PasswordResetComponent = __decorate([
    core_1.Component({
        selector: 'voidwell-password-reset',
        templateUrl: './passwordreset.template.html',
        styleUrls: ['../app.styles.css'],
        providers: [voidwell_api_service_1.VoidwellApi]
    }),
    __metadata("design:paramtypes", [voidwell_api_service_1.VoidwellApi])
], PasswordResetComponent);
exports.PasswordResetComponent = PasswordResetComponent;
