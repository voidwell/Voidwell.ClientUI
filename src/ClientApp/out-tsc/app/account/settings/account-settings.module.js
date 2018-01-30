"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var common_1 = require("@angular/common");
var shared_components_module_1 = require("./../../shared/components/shared-components.module");
var materialLib_module_1 = require("./../../shared/materialLib.module");
var account_settings_wrapper_component_1 = require("./account-settings-wrapper.component");
var change_password_component_1 = require("./change-password/change-password.component");
var account_settings_routes_1 = require("./account-settings.routes");
var AccountSettingsModule = (function () {
    function AccountSettingsModule() {
    }
    return AccountSettingsModule;
}());
AccountSettingsModule = __decorate([
    core_1.NgModule({
        declarations: [
            account_settings_wrapper_component_1.AccountSettingsWrapperComponent,
            change_password_component_1.ChangePasswordComponent
        ],
        imports: [
            forms_1.FormsModule,
            materialLib_module_1.MaterialLib,
            common_1.CommonModule,
            account_settings_routes_1.routing,
            shared_components_module_1.SharedComponentsModule
        ],
        entryComponents: [account_settings_wrapper_component_1.AccountSettingsWrapperComponent]
    })
], AccountSettingsModule);
exports.AccountSettingsModule = AccountSettingsModule;
