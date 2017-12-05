import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';
import { UserSettingsComponent } from './usersettings.component';
import { PasswordResetComponent } from './passwordreset.component';
import { VoidwellAuthGuard } from '../shared/services/voidwell-authguard.service';

const accountRoutes: Routes = [
    {
        path: 'register',
        component: RegisterComponent,
        canActivate: [VoidwellAuthGuard],
        data: { guestOnly: true }
    },
    {
        path: 'settings',
        component: UserSettingsComponent,
        canActivate: [VoidwellAuthGuard],
        data: { roles: ['User'] }
    },
    {
        path: 'resetpassword',
        component: PasswordResetComponent,
        canActivate: [VoidwellAuthGuard],
        data: { roles: ['User'] }
    }
];

export const routing: ModuleWithProviders = RouterModule.forChild(accountRoutes);