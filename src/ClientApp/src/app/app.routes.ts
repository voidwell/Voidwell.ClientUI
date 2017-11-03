import { Routes, RouterModule } from '@angular/router';
//import { IpreoAccountAuthGuard } from './shared/services/ipreoaccount-authguard.service';
//import { IpreoAccountAuthService } from './shared/services/ipreoaccount-auth.service';

const routes: Routes = [
    { path: '', redirectTo: 'blog', pathMatch: 'full' },
    { path: 'blog', loadChildren: './blog/blog.module#BlogModule' }
];

export const appRouterProviders = [
    //IpreoAccountAuthGuard,
    //IpreoAccountAuthService
];

export const routing = RouterModule.forRoot(routes);