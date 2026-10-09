import { Routes } from '@angular/router';
import { AdminWrapperComponent } from './admin-wrapper.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BlogComponent } from './blog/blog.component';
import { EventsComponent } from './events/events.component';
import { StatusWrapperComponent } from './status/status-wrapper.component';
import { ServicesComponent } from './status/services/services.component';
import { StoresComponent } from './status/stores/stores.component';
import { PsbComponent } from './psb/psb.component';
import { VoidwellAuthGuard } from '@core/auth/voidwell-auth-guard.service';

export const ADMIN_ROUTES: Routes = [
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
            }
        ],
        canActivate: [VoidwellAuthGuard],
        data: { roles: ['Administrator', 'Blog', 'Events', 'PSB'] }
    }
];
