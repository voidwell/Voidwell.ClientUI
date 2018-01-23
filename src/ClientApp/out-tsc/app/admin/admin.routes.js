"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
var adminwrapper_component_1 = require("./adminwrapper.component");
var dashboard_component_1 = require("./dashboard.component");
var blog_component_1 = require("./blog.component");
var users_component_1 = require("./users.component");
var roles_component_1 = require("./roles.component");
var events_component_1 = require("./events.component");
var voidwell_authguard_service_1 = require("../shared/services/voidwell-authguard.service");
var adminRoutes = [
    {
        path: '',
        component: adminwrapper_component_1.AdminWrapperComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: dashboard_component_1.DashboardComponent },
            {
                path: 'blog',
                component: blog_component_1.BlogComponent,
                canActivate: [voidwell_authguard_service_1.VoidwellAuthGuard],
                data: { roles: ['Blog'] }
            },
            { path: 'users', component: users_component_1.UsersComponent },
            { path: 'roles', component: roles_component_1.RolesComponent },
            {
                path: 'events',
                component: events_component_1.EventsComponent,
                canActivate: [voidwell_authguard_service_1.VoidwellAuthGuard],
                data: { roles: ['Events'] }
            }
        ],
        canActivate: [voidwell_authguard_service_1.VoidwellAuthGuard],
        data: { roles: ['Administrator'] }
    }
];
exports.routing = router_1.RouterModule.forChild(adminRoutes);
