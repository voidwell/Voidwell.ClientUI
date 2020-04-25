import { Component, Input, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, Inject, Output, EventEmitter } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Secret } from '../models/secret.model';
import { Observable } from 'rxjs';

export class SecretListChange {
    constructor(
      public source: SecretManagerComponent,
      public value: Secret[]) { }
}

@Component({
    selector: 'vw-secret-manager',
    templateUrl: './secret-manager.template.html',
    styleUrls: ['./secret-manager.styles.css'],
    host: {
        'class': 'vw-secret-manager'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class SecretManagerComponent implements OnInit {
    private _valueList: Secret[] = [];
    private _isDeletingSecret: boolean = false;

    @Input() onGenerate: (request: NewSecretRequestData) => Observable<any>;
    @Input() onDelete: (value: string) => Observable<any>;
    @Input() loadSource: Observable<any>;

    get value(): Secret[] { return this._valueList; }
    set value(value: Secret[]) {
        this._valueList = value;
        this._changeDetectorRef.markForCheck();
    }

    @Output() readonly reload: EventEmitter<any> = new EventEmitter<any>();

    constructor(private _changeDetectorRef: ChangeDetectorRef, public dialog: MatDialog) {
    }

    ngOnInit() {
        this.loadSource.subscribe((secrets: Secret[]) => this.value = secrets);
    }

    _onGenerateClick(event: Event) {
        event.stopPropagation();
    
        this.dialog.open(SecretManagerNewSecretDialog, {})
            .afterClosed().subscribe((result: NewSecretRequestData) => {
                if(!result) {
                    return;
                }
                this.onGenerate(result)
                    .subscribe(secret => {
                        this.dialog.open(SecretManagerShowSecretDialog, {
                            data: secret
                        }).afterClosed().subscribe(() => {
                            this.reload.emit();
                        });
                    }); 
            });
    }

    _onDeleteClick(event: Event, secret: Secret) {
        if (this._isDeletingSecret) {
            return;
        }

        this._isDeletingSecret = true;
        event.stopPropagation();

        this.dialog.open(SecretManagerDeleteSecretDialog, {
                data: secret
            }).afterClosed().subscribe(confirmed => {
                if(!confirmed) {
                    return;
                }
                this.onDelete(secret.id)
                    .subscribe(() => {
                        this._isDeletingSecret = false;
                        this.value.splice(this.value.indexOf(secret), 1);
                        this._changeDetectorRef.markForCheck();
                    }); 
            });
    }
}

export class NewSecretRequestData {
    description: string;
    expiration: string;
}

@Component({
    selector: 'secret-manager-new-secret-dialog',
    templateUrl: 'secret-manager-new-secret-dialog.html',
})
export class SecretManagerNewSecretDialog {
    data: NewSecretRequestData = new NewSecretRequestData();

    constructor(
        public dialogRef: MatDialogRef<SecretManagerNewSecretDialog>) {}
}

@Component({
    selector: 'secret-manager-show-secret-dialog',
    templateUrl: 'secret-manager-show-secret-dialog.html',
})
export class SecretManagerShowSecretDialog {
    constructor(
        public dialogRef: MatDialogRef<SecretManagerShowSecretDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {}
}

@Component({
    selector: 'secret-manager-delete-secret-dialog',
    templateUrl: 'secret-manager-delete-secret-dialog.html',
})
export class SecretManagerDeleteSecretDialog {
    constructor(
        public dialogRef: MatDialogRef<SecretManagerDeleteSecretDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {}
}