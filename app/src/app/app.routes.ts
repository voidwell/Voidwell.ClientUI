import { Routes } from '@angular/router';
import { VoidwellAuthGuard } from '@core/auth/voidwell-auth-guard.service';
import { VoidwellAuthService } from '@core/auth/voidwell-auth.service';

export const routes: Routes = [
    { path: '', redirectTo: 'blog', pathMatch: 'full' },
    { path: 'blog', loadChildren: () => import('@features/blog/blog.routes').then(m => m.BLOG_ROUTES) },
    { path: 'account', loadChildren: () => import('@features/account/account.routes').then(m => m.ACCOUNT_ROUTES) },
    { path: 'account/settings', loadChildren: () => import('@features/account/settings/account-settings.routes').then(m => m.ACCOUNT_SETTINGS_ROUTES) },
    { path: 'admin', loadChildren: () => import('@features/admin/admin.routes').then(m => m.ADMIN_ROUTES) },
    { path: 'ps2', loadChildren: () => import('@features/planetside/planetside.routes').then(m => m.PLANETSIDE_ROUTES) }
];

export const appRouterProviders = [
    VoidwellAuthGuard,
    VoidwellAuthService
];
