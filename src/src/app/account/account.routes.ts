import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { RegisterComponent } from './register.component';
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
        path: 'resetpassword',
        component: PasswordResetComponent,
        canActivate: [VoidwellAuthGuard],
        data: { guestOnly: true }
    }
];

export const routing: ModuleWithProviders = RouterModule.forChild(accountRoutes);