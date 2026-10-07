import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { FormsModule } from '@angular/forms';

export class DialogData {
    clientId: string;
    clientName: string;
}

@Component({
    selector: 'clients-list-new-dialog',
    templateUrl: './clients-list-new-dialog.component.html',
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
export class ClientsListNewDialog {
    dialogRef = inject<MatDialogRef<ClientsListNewDialog>>(MatDialogRef);

    data: DialogData = new DialogData();

    onNoClick(): void {
        this.dialogRef.close();
    }
}
