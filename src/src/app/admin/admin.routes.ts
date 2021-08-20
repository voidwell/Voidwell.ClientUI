import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { AdminWrapperComponent } from './adminwrapper.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BlogComponent } from './blog/blog.component';
import { UsersComponent } from './users/users.component';
import { RolesComponent } from './roles/roles.component';
import { EventsComponent } from './events/events.component';
import { StatusWrapperComponent } from './status/statuswrappaer.component';
import { ServicesComponent } from './status/services/services.component';
import { StoresComponent } from './status/stores/stores.component';
import { PsbComponent } from './psb/psb.component';
import { OidcWrapperComponent } from './oidc/oidcwrapper.component';
import { ClientsListComponent } from './oidc/clients/clients-list.component';
import { ClientDetailsComponent } from './oidc/clients/client-details/client-details.component';
import { ApiResourcesListComponent } from './oidc/api-resources/api-resources-list.component';
import { ApiResourceDetailsComponent } from './oidc/api-resources//api-resource-details/api-resource-details.component'
import { VoidwellAuthGuard } from '../shared/services/voidwell-authguard.service';

const adminRoutes: Routes = [
    {
        path: '',
        component: AdminWrapperComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },
            {
                path: 'users',
                component: UsersComponent,
                data: { roles: ['Administrator'] }
            },
            {
                path: 'roles',
                component: RolesComponent,
                data: { roles: ['Administrator'] }
            },
            {
                path: 'blog',
                component: BlogComponent,
                canActivate: [VoidwellAuthGuard],
                data: { roles: ['Administrator', 'Blog'] }
            },
            {
                path: 'events',
                component: EventsComponent,
                canActivate: [VoidwellAuthGuard],
                data: { roles: ['Administrator', 'Events'] }
            },
            {
                path: 'psb',
                component: PsbComponent,
                canActivate: [VoidwellAuthGuard],
                data: { roles: ['Administrator', 'PSB'] }
            },
            {
                path: 'status',
                component: StatusWrapperComponent,
                data: { roles: ['Administrator'] },
                children: [
                    { path: 'services', component: ServicesComponent },
                    { path: 'stores', component: StoresComponent },
                ]
            },
            {
                path: 'oidc',
                component: OidcWrapperComponent,
                data: { roles: ['Administrator'] },
                children: [
                    { path: 'clients', component: ClientsListComponent },
                    { path: 'clients/:clientId', component: ClientDetailsComponent },
                    { path: 'resources', component: ApiResourcesListComponent },
                    { path: 'resources/:resourceId', component: ApiResourceDetailsComponent }
                ]
            }
        ],
        canActivate: [VoidwellAuthGuard],
        data: { roles: ['Administrator', 'Blog', 'Events', 'PSB'] }
    }
];

export const routing: ModuleWithProviders = RouterModule.forChild(adminRoutes);