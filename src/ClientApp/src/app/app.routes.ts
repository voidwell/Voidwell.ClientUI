import { Routes, RouterModule } from '@angular/router';
import { VoidwellAuthGuard } from './shared/services/voidwell-authguard.service';
import { VoidwellAuthService } from './shared/services/voidwell-auth.service';

const routes: Routes = [
    { path: '', redirectTo: 'blog', pathMatch: 'full' },
    { path: 'blog', loadChildren: './blog/blog.module#BlogModule' },
    { path: 'account', loadChildren: './account/account.module#AccountModule' },
    { path: 'admin', loadChildren: './admin/admin.module#AdminModule' },
    { path: 'ps2', loadChildren: './planetside/planetside.module#PlanetsideModule' }
];

export const appRouterProviders = [
    VoidwellAuthGuard,
    VoidwellAuthService
];

export const routing = RouterModule.forRoot(routes);