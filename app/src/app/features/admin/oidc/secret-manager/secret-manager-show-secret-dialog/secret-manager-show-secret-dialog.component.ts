import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { CdkScrollable } from '@angular/cdk/scrolling';

@Component({
    selector: 'secret-manager-show-secret-dialog',
    templateUrl: './secret-manager-show-secret-dialog.component.html',
    imports: [
        MatDialogTitle,
        CdkScrollable,
        MatDialogContent,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
})
export class SecretManagerShowSecretDialog {
    dialogRef = inject<MatDialogRef<SecretManagerShowSecretDialog>>(MatDialogRef);
    data = inject(MAT_DIALOG_DATA);
}
