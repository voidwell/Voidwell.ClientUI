import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { PlanetsideWrapperComponent } from './planetsidewrapper.component';
import { PlanetsideNewsComponent } from './news/planetside-news.component';

const planetsideRoutes: Routes = [
    {
        path: '',
        component: PlanetsideWrapperComponent,
        children: [
            { path: '', redirectTo: 'news', pathMatch: 'full' },
            { path: 'news', component: PlanetsideNewsComponent }
        ]
    }
];

export const routing: ModuleWithProviders = RouterModule.forChild(planetsideRoutes);