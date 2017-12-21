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
var shared_components_module_1 = require("../shared/components/shared-components.module");
var materialLib_module_1 = require("../shared/materialLib.module");
var login_component_1 = require("./login.component");
var register_component_1 = require("./register.component");
var passwordreset_component_1 = require("./passwordreset.component");
var usersettings_component_1 = require("./usersettings.component");
var changepassword_component_1 = require("./settings-cards/changepassword.component");
var account_routes_1 = require("./account.routes");
var AccountModule = (function () {
    function AccountModule() {
    }
    return AccountModule;
}());
AccountModule = __decorate([
    core_1.NgModule({
        declarations: [
            login_component_1.LoginComponent,
            register_component_1.RegisterComponent,
            passwordreset_component_1.PasswordResetComponent,
            usersettings_component_1.UserSettingsComponent,
            changepassword_component_1.ChangePasswordCardComponent
        ],
        imports: [
            forms_1.FormsModule,
            materialLib_module_1.MaterialLib,
            common_1.CommonModule,
            account_routes_1.routing,
            shared_components_module_1.SharedComponentsModule
        ],
        entryComponents: [login_component_1.LoginComponent]
    })
], AccountModule);
exports.AccountModule = AccountModule;
