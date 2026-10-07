import { Component, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { UserDetails } from '@core/api/models/auth/auth-admin.model';
import { AuthAdminRepository } from '@core/api/auth/auth-admin.repository';
import { getErrorMessage } from '@core/util/error-message';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { MatFormField } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { MatSelect, MatOption } from '@angular/material/select';

@Component({
    selector: 'user-editor-dialog',
    templateUrl: './user-editor-dialog.component.html',
    imports: [
        LoaderComponent,
        ErrorMessageComponent,
        FormsModule,
        MatFormField,
        MatSelect,
        MatOption,
        MatButton,
        DatePipe,
    ],
})
export class UserEditorDialog {
    dialogRef = inject<MatDialogRef<UserEditorDialog>>(MatDialogRef);
    private authAdminRepository = inject(AuthAdminRepository);
    data = inject(MAT_DIALOG_DATA);

    public errorMessage: string;
    public isLoading: boolean;
    public isLocked: boolean;
    public user: UserDetails;

    constructor() {
        this.isLoading = true;

        this.authAdminRepository.getUser(this.data.userId)
            .pipe(catchError(error => {
                this.errorMessage = getErrorMessage(error);
                return throwError(() => error);
            }))
            .pipe(finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(user => {
                this.user = user;
            });
    }

    onRoleDropdownToggle(isOpen: boolean, userRolesForm: NgForm) {
        if (isOpen || userRolesForm.pristine) {
            return;
        }

        this.errorMessage = null;
        this.isLocked = true;
        
        this.authAdminRepository.updateUserRoles(this.user.id, userRolesForm.value)
            .pipe(catchError(error => {
                this.errorMessage = getErrorMessage(error);
                userRolesForm.form.patchValue(this.user);
                return throwError(() => error);
            }))
            .pipe(finalize(() => {
                this.isLocked = false;
                userRolesForm.form.markAsPristine();
            }))
            .subscribe(updatedRoles => {
                this.user.roles = updatedRoles;
            });
    }

    lockUser() {
        this.errorMessage = null;
        this.isLocked = true;

        const params = {
            isPermanant: true,
            lockLength: 60
        };

        this.authAdminRepository.lockUser(this.user.id, params)
            .pipe(catchError(error => {
                this.errorMessage = getErrorMessage(error);
                return throwError(() => error);
            }))
            .pipe(finalize(() => {
                this.isLocked = false;
            }))
            .subscribe();
    }

    unlockUser() {
        this.errorMessage = null;
        this.isLocked = true;

        this.authAdminRepository.unlockUser(this.user.id)
            .pipe(catchError(error => {
                this.errorMessage = getErrorMessage(error);
                return throwError(() => error);
            }))
            .pipe(finalize(() => {
                this.isLocked = false;
            }))
            .subscribe();
    }

    closeDialog() {
        this.dialogRef.close();
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
