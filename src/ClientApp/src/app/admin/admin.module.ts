import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialLib } from '../shared/materialLib.module';
import { routing } from './admin.routes';
import { AdminWrapperComponent } from './adminwrapper.component';
import { DashboardComponent } from './dashboard.component';
import { BlogComponent } from './blog.component';
import { UsersComponent } from './users.component';
import { RolesComponent } from './roles.component';

@NgModule({
    imports: [
        FormsModule,
        MaterialLib,
        CommonModule,
        routing
    ],
    declarations: [
        AdminWrapperComponent,
        DashboardComponent,
        BlogComponent,
        UsersComponent,
        RolesComponent
    ],
    entryComponents: [AdminWrapperComponent]
})
export class AdminModule { }
