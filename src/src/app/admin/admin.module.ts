import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialLib } from '../shared/materialLib.module';
import { MatDatetimepickerModule, MatNativeDatetimeModule } from '@mat-datetimepicker/core'
import { SharedComponentsModule } from '../shared/components/shared-components.module';
import { VoidwellPipesModule } from '../shared/pipes/voidwellpipes.modules';
import { routing } from './admin.routes';
import { AdminWrapperComponent } from './adminwrapper.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BlogComponent, BlogEditorDialog } from './blog/blog.component';
import { UsersComponent, UserEditorDialog } from './users/users.component';
import { RolesComponent } from './roles/roles.component';
import { EventsComponent, EventEditorDialog } from './events/events.component';
import { StatusWrapperComponent } from './status/statuswrappaer.component';
import { ServicesComponent } from './status/services/services.component';
import { StoresComponent } from './status/stores/stores.component';
import { PsbComponent } from './psb/psb.component';
import { OidcWrapperComponent } from './oidc/oidcwrapper.component';
import { ClientsListComponent, ClientsListNewDialog } from './oidc/clients/clients-list.component';
import { ClientDetailsComponent, ClientDetailsDeleteDialog } from './oidc/clients/client-details/client-details.component';
import { ApiResourcesListComponent, ApiResourcesListNewDialog } from './oidc/api-resources/api-resources-list.component';
import { ApiResourceDetailsComponent, ApiResourceDetailsDeleteDialog } from './oidc/api-resources/api-resource-details/api-resource-details.component';
import { SecretManagerComponent, SecretManagerNewSecretDialog, SecretManagerShowSecretDialog, SecretManagerDeleteSecretDialog } from './oidc/secret-manager/secret-manager.component';


@NgModule({
    declarations: [
        AdminWrapperComponent,
        DashboardComponent,
        BlogComponent,
        UsersComponent,
        RolesComponent,
        EventsComponent,
        StatusWrapperComponent,
        ServicesComponent,
        StoresComponent,
        PsbComponent,
        OidcWrapperComponent,
        ClientsListComponent,
        ClientsListNewDialog,
        ClientDetailsComponent,
        ClientDetailsDeleteDialog,
        ApiResourceDetailsComponent,
        ApiResourceDetailsDeleteDialog,
        ApiResourcesListComponent,
        ApiResourcesListNewDialog,
        EventEditorDialog,
        UserEditorDialog,
        BlogEditorDialog,
        SecretManagerComponent,
        SecretManagerNewSecretDialog,
        SecretManagerShowSecretDialog,
        SecretManagerDeleteSecretDialog,
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MaterialLib,
        CommonModule,
        VoidwellPipesModule,
        routing,
        SharedComponentsModule,
        MatNativeDatetimeModule,
        MatDatetimepickerModule
    ],
    entryComponents: [
        AdminWrapperComponent,
        EventEditorDialog,
        UserEditorDialog,
        BlogEditorDialog,
        ApiResourcesListNewDialog,
        ApiResourceDetailsDeleteDialog,
        ClientsListNewDialog,
        ClientDetailsDeleteDialog,
        SecretManagerNewSecretDialog,
        SecretManagerShowSecretDialog,
        SecretManagerDeleteSecretDialog
    ]
})
export class AdminModule { }
