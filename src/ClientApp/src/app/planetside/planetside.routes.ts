import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { PlanetsideWrapperComponent } from './planetsidewrapper.component';
import { PlanetsideNewsComponent } from './news/planetside-news.component';
import { PlanetsidePlayerComponent } from './player/planetside-player.component';
import { PlanetsideItemComponent } from './item/planetside-item.component';

const planetsideRoutes: Routes = [
    {
        path: '',
        component: PlanetsideWrapperComponent,
        children: [
            { path: '', redirectTo: 'news', pathMatch: 'full' },
            { path: 'news', component: PlanetsideNewsComponent },
            { path: 'item/:id', component: PlanetsideItemComponent },
            { path: 'player/:id', component: PlanetsidePlayerComponent }
        ]
    }
];

export const routing: ModuleWithProviders = RouterModule.forChild(planetsideRoutes);