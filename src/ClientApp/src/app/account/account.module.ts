import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialLib } from '../shared/materialLib.module';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';
import { PasswordResetComponent } from './passwordreset.component';
import { UserSettingsComponent } from './usersettings.component';
import { ChangePasswordCardComponent } from './settings-cards/changepassword.component';
import { routing } from './account.routes';

@NgModule({
    imports: [
        FormsModule,
        MaterialLib,
        CommonModule,
        routing
    ],
    declarations: [
        LoginComponent,
        RegisterComponent,
        PasswordResetComponent,
        UserSettingsComponent,
        ChangePasswordCardComponent
    ],
    entryComponents: [LoginComponent]
})
export class AccountModule { }
