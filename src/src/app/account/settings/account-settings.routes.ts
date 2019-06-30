import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { VoidwellAuthGuard } from './../../shared/services/voidwell-authguard.service';
import { AccountSettingsWrapperComponent } from './account-settings-wrapper.component';
import { ChangePasswordComponent } from './change-password/change-password.component';

const routes: Routes = [
    {
        path: '',
        component: AccountSettingsWrapperComponent,
        canActivate: [VoidwellAuthGuard],
        data: { roles: ['User'] },
        children: [
            { path: '', redirectTo: 'password', pathMatch: 'full' },
            { path: 'password', component: ChangePasswordComponent }
        ]
    }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);