"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
var voidwell_authguard_service_1 = require("./../../shared/services/voidwell-authguard.service");
var account_settings_wrapper_component_1 = require("./account-settings-wrapper.component");
var change_password_component_1 = require("./change-password/change-password.component");
var routes = [
    {
        path: '',
        component: account_settings_wrapper_component_1.AccountSettingsWrapperComponent,
        canActivate: [voidwell_authguard_service_1.VoidwellAuthGuard],
        data: { roles: ['User'] },
        children: [
            { path: '', redirectTo: 'password', pathMatch: 'full' },
            { path: 'password', component: change_password_component_1.ChangePasswordComponent }
        ]
    }
];
exports.routing = router_1.RouterModule.forChild(routes);
