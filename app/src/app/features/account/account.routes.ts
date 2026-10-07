import { Routes } from '@angular/router';
import { RegisterComponent } from './register.component';
import { PasswordResetComponent } from './password-reset.component';
import { VoidwellAuthGuard } from '@core/auth/voidwell-auth-guard.service';

export const ACCOUNT_ROUTES: Routes = [
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
