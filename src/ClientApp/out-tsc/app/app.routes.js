"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
var voidwell_authguard_service_1 = require("./shared/services/voidwell-authguard.service");
var voidwell_auth_service_1 = require("./shared/services/voidwell-auth.service");
var routes = [
    { path: '', redirectTo: 'blog', pathMatch: 'full' },
    { path: 'blog', loadChildren: './blog/blog.module#BlogModule' },
    { path: 'account', loadChildren: './account/account.module#AccountModule' },
    { path: 'admin', loadChildren: './admin/admin.module#AdminModule' },
    { path: 'ps2', loadChildren: './planetside/planetside.module#PlanetsideModule' }
];
exports.appRouterProviders = [
    voidwell_authguard_service_1.VoidwellAuthGuard,
    voidwell_auth_service_1.VoidwellAuthService
];
exports.routing = router_1.RouterModule.forRoot(routes);
