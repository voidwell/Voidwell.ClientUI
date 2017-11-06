import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';
import { routing } from './login.routes';

@NgModule({
    imports: [
        CommonModule,
        routing
    ],
    declarations: [
        LoginComponent,
        RegisterComponent
    ],
    entryComponents: [LoginComponent]
})
export class LoginModule { }
