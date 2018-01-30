import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedComponentsModule } from './../../shared/components/shared-components.module';
import { MaterialLib } from './../../shared/materialLib.module';
import { AccountSettingsWrapperComponent } from './account-settings-wrapper.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { routing } from './account-settings.routes';

@NgModule({
    declarations: [
        AccountSettingsWrapperComponent,
        ChangePasswordComponent
    ],
    imports: [
        FormsModule,
        MaterialLib,
        CommonModule,
        routing,
        SharedComponentsModule
    ],
    entryComponents: [AccountSettingsWrapperComponent]
})
export class AccountSettingsModule { }
