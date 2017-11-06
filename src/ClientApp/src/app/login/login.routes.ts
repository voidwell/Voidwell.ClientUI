import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';

const loginRoutes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    }
];

export const routing: ModuleWithProviders = RouterModule.forChild(loginRoutes);