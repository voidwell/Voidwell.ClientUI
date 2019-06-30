import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { PSAWrapperComponent } from './psawrapper.component';

const planetsideArenaRoutes: Routes = [
    {
        path: '',
        component: PSAWrapperComponent,
    }
];

export const routing: ModuleWithProviders = RouterModule.forChild(planetsideArenaRoutes);