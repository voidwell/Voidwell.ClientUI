import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { PlanetsideWrapperComponent } from './planetsidewrapper.component';
import { PlanetsideNewsComponent } from './news/planetside-news.component';
import { PlanetsidePlayerComponent } from './player/planetside-player.component';
import { PlanetsideItemComponent } from './item/planetside-item.component';
import { PlanetsidePlayerStatsComponent } from './player/stats/planetside-player-stats.component';
import { PlanetsidePlayerClassesComponent } from './player/classes/planetside-player-classes.component';
import { PlanetsidePlayerVehiclesComponent } from './player/vehicles/planetside-player-vehicles.component';
import { PlanetsidePlayerWeaponsComponent } from './player/weapons/planetside-player-weapons.component';

const planetsideRoutes: Routes = [
    {
        path: '',
        component: PlanetsideWrapperComponent,
        children: [
            { path: '', redirectTo: 'news', pathMatch: 'full' },
            { path: 'news', component: PlanetsideNewsComponent },
            { path: 'item/:id', component: PlanetsideItemComponent },
            {
                path: 'player/:id',
                component: PlanetsidePlayerComponent,
                children: [
                    { path: '', redirectTo: 'stats', pathMatch: 'full' },
                    { path: 'stats', component: PlanetsidePlayerStatsComponent },
                    { path: 'classes', component: PlanetsidePlayerClassesComponent },
                    { path: 'classes/:id', component: PlanetsidePlayerClassesComponent },
                    { path: 'vehicles', component: PlanetsidePlayerVehiclesComponent },
                    { path: 'vehicles/:id', component: PlanetsidePlayerVehiclesComponent },
                    { path: 'weapons', component: PlanetsidePlayerWeaponsComponent }
                ]
            }
        ]
    }
];

export const routing: ModuleWithProviders = RouterModule.forChild(planetsideRoutes);