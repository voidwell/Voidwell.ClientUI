"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
var register_component_1 = require("./register.component");
var usersettings_component_1 = require("./usersettings.component");
var passwordreset_component_1 = require("./passwordreset.component");
var voidwell_authguard_service_1 = require("../shared/services/voidwell-authguard.service");
var accountRoutes = [
    {
        path: 'register',
        component: register_component_1.RegisterComponent,
        canActivate: [voidwell_authguard_service_1.VoidwellAuthGuard],
        data: { guestOnly: true }
    },
    {
        path: 'settings',
        component: usersettings_component_1.UserSettingsComponent,
        canActivate: [voidwell_authguard_service_1.VoidwellAuthGuard],
        data: { roles: ['User'] }
    },
    {
        path: 'resetpassword',
        component: passwordreset_component_1.PasswordResetComponent,
        canActivate: [voidwell_authguard_service_1.VoidwellAuthGuard],
        data: { roles: ['User'] }
    }
];
exports.routing = router_1.RouterModule.forChild(accountRoutes);
