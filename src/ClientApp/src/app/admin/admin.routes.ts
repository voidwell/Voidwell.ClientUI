import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { AdminWrapperComponent } from './adminwrapper.component';
import { DashboardComponent } from './dashboard.component';
import { BlogComponent } from './blog.component';
import { UsersComponent } from './users.component';
import { RolesComponent } from './roles.component';
import { EventsComponent } from './events.component';
import { ServicesComponent } from './services.component';
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
                data: { roles: ['Administrator', 'SuperAdmin'] }
            },
            {
                path: 'roles',
                component: RolesComponent,
                data: { roles: ['Administrator', 'SuperAdmin'] }
            },
            {
                path: 'blog',
                component: BlogComponent,
                canActivate: [VoidwellAuthGuard],
                data: { roles: ['Administrator', 'SuperAdmin', 'Blog'] }
            },
            {
                path: 'events',
                component: EventsComponent,
                canActivate: [VoidwellAuthGuard],
                data: { roles: ['Administrator', 'SuperAdmin', 'Events'] }
            },
            {
                path: 'services',
                component: ServicesComponent,
                data: { roles: ['Administrator', 'SuperAdmin'] }
            }
        ],
        canActivate: [VoidwellAuthGuard],
        data: { roles: ['Administrator', 'SuperAdmin', 'Blog', 'Events'] }
    }
];

export const routing: ModuleWithProviders = RouterModule.forChild(adminRoutes);