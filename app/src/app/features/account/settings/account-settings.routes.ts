import { Routes } from '@angular/router';
import { VoidwellAuthGuard } from '@core/auth/voidwell-auth-guard.service';
import { AccountSettingsWrapperComponent } from './account-settings-wrapper.component';
import { ChangePasswordComponent } from './change-password/change-password.component';

export const ACCOUNT_SETTINGS_ROUTES: Routes = [
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
