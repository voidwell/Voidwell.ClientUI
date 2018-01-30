import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { MaterialLib } from '../shared/materialLib.module';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';
import { PasswordResetComponent } from './passwordreset.component';
import { routing } from './account.routes';

@NgModule({
    declarations: [
        LoginComponent,
        RegisterComponent,
        PasswordResetComponent
    ],
    imports: [
        FormsModule,
        MaterialLib,
        CommonModule,
        routing,
        SharedComponentsModule
    ],
    entryComponents: [LoginComponent]
})
export class AccountModule { }
