import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subscription, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { SimpleRole } from '@core/api/models/auth/auth-admin.model';
import { AuthAdminRepository } from '@core/api/auth/auth-admin.repository';
import { getErrorMessage } from '@core/util/error-message';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelActionRow } from '@angular/material/expansion';
import { JsonPipe } from '@angular/common';

/** A role with the UI state of its row. */
type RoleRow = SimpleRole & { isLoading?: boolean };

@Component({
    selector: 'voidwell-admin-roles',
    templateUrl: './roles.component.html',
    imports: [LoaderComponent, MatFormField, MatInput, MatButton, MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelActionRow, JsonPipe]
})

export class RolesComponent implements OnInit, OnDestroy {
    private authAdminRepository = inject(AuthAdminRepository);

    isLoading: boolean;
    errorMessage: string = null;
    roles: RoleRow[];
    getRolesRequest: Subscription;

    ngOnInit() {
        this.isLoading = true;
        this.getRolesRequest = this.authAdminRepository.getRoles()
            .subscribe(roles => {
                this.roles = roles;
                this.isLoading = false;
            });
    }

    addRole(roleName: string) {
        this.errorMessage = null;
        this.isLoading = true;
        this.authAdminRepository.createRole({ name: roleName })
            .pipe(catchError(error => {
                this.errorMessage = getErrorMessage(error);
                return throwError(() => error);
            }))
            .pipe(finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(role => {
                this.roles.push(role);
            });
    }

    deleteRole(role: SimpleRole) {
        this.errorMessage = null;
        this.isLoading = true;
        this.authAdminRepository.deleteRole(role.id)
            .pipe(catchError(error => {
                this.errorMessage = getErrorMessage(error);
                return throwError(() => error);
            }))
            .pipe(finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(result => {
                const idx = this.roles.indexOf(role);
                this.roles.splice(idx, 1);
            });
    }

    getDetails(role: SimpleRole) {
        /*
        role.isLoading = true;
        this.api.getUsersInRole(role.name).subscribe(users => {
            role.isLoading = false;
            role.users = users;
        });;
        */
    }

    ngOnDestroy() {
        if (this.getRolesRequest) {
            this.getRolesRequest.unsubscribe();
        }
    }
}