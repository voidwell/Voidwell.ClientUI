import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { AdminWrapperComponent } from './adminwrapper.component';
import { DashboardComponent } from './dashboard.component';
import { BlogComponent } from './blog.component';
import { UsersComponent } from './users.component';
import { RolesComponent } from './roles.component';
import { VoidwellAuthGuard } from '../shared/services/voidwell-authguard.service';

const adminRoutes: Routes = [
    {
        path: '',
        component: AdminWrapperComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },
            {
                path: 'blog',
                component: BlogComponent,
                canActivate: [VoidwellAuthGuard],
                data: { roles: ['Blog'] }

            },
            { path: 'users', component: UsersComponent },
            { path: 'roles', component: RolesComponent }
        ],
        canActivate: [VoidwellAuthGuard],
        data: { roles: ['Administrator'] }
    }
];

export const routing: ModuleWithProviders = RouterModule.forChild(adminRoutes);