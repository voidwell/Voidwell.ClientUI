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
var voidwell_api_service_1 = require("../shared/services/voidwell-api.service");
var RegisterComponent = (function () {
    function RegisterComponent(api, ngRedux) {
        var _this = this;
        this.api = api;
        this.ngRedux = ngRedux;
        this.self = this;
        this.errorMessage = null;
        this.completedInfo = false;
        this.registrationSuccess = false;
        this.isLoading = false;
        this.selectedTabIndex = 0;
        this.securityQuestions = null;
        this.registrationState = this.ngRedux.select('registration');
        this.registrationState.subscribe(function (registration) {
            if (registration) {
                if (registration.isSuccess) {
                    _this.registrationSuccess = true;
                }
                if (registration.status === 'loading') {
                    _this.isLoading = true;
                    _this.errorMessage = null;
                }
                else {
                    _this.isLoading = false;
                }
                if (registration.status === 'error') {
                    _this.errorMessage = registration.errorMessage;
                }
            }
        });
    }
    RegisterComponent.prototype.onSubmitInformation = function (registerForm) {
        if (registerForm.valid) {
            this.completedInfo = true;
            this.selectedTabIndex = 1;
            if (this.securityQuestions == null) {
                this.registrationInfo = registerForm.value;
                this.loadSecurityQuestions();
            }
        }
    };
    RegisterComponent.prototype.onSubmitQuestions = function (securityQuestionsForm) {
        if (securityQuestionsForm.valid) {
            var formQuestions = securityQuestionsForm.value;
            var questions = [
                { question: formQuestions.question0, answer: formQuestions.answer0 },
                { question: formQuestions.question1, answer: formQuestions.answer1 },
                { question: formQuestions.question2, answer: formQuestions.answer2 }
            ];
            this.registrationInfo.securityQuestions = questions;
            this.api.accountRegister(this.registrationInfo);
        }
    };
    RegisterComponent.prototype.loadSecurityQuestions = function () {
        var _this = this;
        this.api.getSecurityQuestions()
            .subscribe(function (result) {
            _this.securityQuestions = result;
        });
    };
    return RegisterComponent;
}());
RegisterComponent = __decorate([
    core_1.Component({
        selector: 'voidwell-register',
        templateUrl: './register.template.html',
        styleUrls: ['account.styles.css'],
        providers: [voidwell_api_service_1.VoidwellApi]
    }),
    __metadata("design:paramtypes", [voidwell_api_service_1.VoidwellApi, store_1.NgRedux])
], RegisterComponent);
exports.RegisterComponent = RegisterComponent;
