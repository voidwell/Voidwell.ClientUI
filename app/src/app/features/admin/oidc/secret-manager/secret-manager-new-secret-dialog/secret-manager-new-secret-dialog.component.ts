import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

export class NewSecretRequestData {
    description: string;
    expiration: string;
}

@Component({
    selector: 'secret-manager-new-secret-dialog',
    templateUrl: './secret-manager-new-secret-dialog.component.html',
    imports: [
        MatDialogTitle,
        CdkScrollable,
        MatDialogContent,
        MatFormField,
        MatInput,
        FormsModule,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
})
export class SecretManagerNewSecretDialog {
    dialogRef = inject<MatDialogRef<SecretManagerNewSecretDialog>>(MatDialogRef);

    data: NewSecretRequestData = new NewSecretRequestData();
}
