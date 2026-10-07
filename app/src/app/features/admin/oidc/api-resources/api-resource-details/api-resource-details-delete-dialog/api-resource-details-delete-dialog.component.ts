import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { CdkScrollable } from '@angular/cdk/scrolling';

@Component({
    selector: 'api-resource-details-delete-dialog',
    templateUrl: './api-resource-details-delete-dialog.component.html',
    imports: [
        MatDialogTitle,
        CdkScrollable,
        MatDialogContent,
        MatDialogActions,
        MatButton,
        MatDialogClose,
    ],
})
export class ApiResourceDetailsDeleteDialog {
    dialogRef = inject<MatDialogRef<ApiResourceDetailsDeleteDialog>>(MatDialogRef);
}
