import { Component, Input, OnChanges, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, Inject, Output, EventEmitter } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Secret } from '../models/secret.model';
import { Observable } from 'rxjs';
import { VoidwellApi } from '../../../shared/services/voidwell-api.service';

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

export class SecretManagerComponent implements OnChanges {
    private _valueList: Secret[] = [];
    private _isDeletingSecret: boolean = false;
    private _onLoadSource: () => Observable<Secret[]>;
    private _onDelete: (secretId: string) => Observable<any>;
    private _onGenerate: (req: NewSecretRequestData) => Observable<Secret>;

    @Input() ownerId: string;
    @Input() ownerType: string;

    get value(): Secret[] { return this._valueList; }
    set value(value: Secret[]) {
        this._valueList = value;
        this._changeDetectorRef.markForCheck();
    }

    @Output() readonly reload: EventEmitter<any> = new EventEmitter<any>();

    constructor(private _changeDetectorRef: ChangeDetectorRef, public dialog: MatDialog, private api: VoidwellApi) {
    }

    ngOnChanges() {
        if (this.ownerType.toLowerCase() === 'client') {
            this._onLoadSource = () => this.api.getClientSecrets(this.ownerId);
            this._onDelete = (secretId: string) => this.api.deleteClientSecret(this.ownerId, secretId);
            this._onGenerate = (req: NewSecretRequestData) => this.api.createClientSecret(this.ownerId, { description: req.description, expiration: req.expiration })
        } else if (this.ownerType.toLowerCase() === 'resource') {
            this._onLoadSource = () => this.api.getApiResourceSecrets(this.ownerId);
            this._onDelete = (secretId: string) => this.api.deleteApiResourceSecret(this.ownerId, secretId);
            this._onGenerate = (req: NewSecretRequestData) => this.api.createApiResourceSecret(this.ownerId, { description: req.description, expiration: req.expiration })
        }

        this._onLoadSource().subscribe((secrets: Secret[]) => this.value = secrets);
    }

    _onGenerateClick(event: Event) {
        event.stopPropagation();
    
        this.dialog.open(SecretManagerNewSecretDialog, {})
            .afterClosed().subscribe((result: NewSecretRequestData) => {
                if(!result) {
                    return;
                }
                this._onGenerate(result)
                    .subscribe(secret => {
                        this.dialog.open(SecretManagerShowSecretDialog, {
                            data: secret
                        }).afterClosed().subscribe(() => {
                            this.value.push(secret);
                            this._changeDetectorRef.markForCheck();
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
                this._onDelete(secret.id)
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