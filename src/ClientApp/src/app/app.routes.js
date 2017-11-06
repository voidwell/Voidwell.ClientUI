"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
//import { IpreoAccountAuthGuard } from './shared/services/ipreoaccount-authguard.service';
//import { IpreoAccountAuthService } from './shared/services/ipreoaccount-auth.service';
var routes = [
    { path: '', redirectTo: 'blog', pathMatch: 'full' },
    { path: 'blog', loadChildren: './blog/blog.module#BlogModule' },
    { path: 'account', loadChildren: './login/login.module#LoginModule' }
];
exports.appRouterProviders = [];
exports.routing = router_1.RouterModule.forRoot(routes);
