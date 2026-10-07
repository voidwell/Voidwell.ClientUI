import { Component, Input, OnChanges, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, Output, EventEmitter, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Secret } from '@core/api/models/auth/oidc-secret.model';
import { SecretResponse } from '@core/api/models/auth/oidc-secret-response.model';
import { Observable } from 'rxjs';
import { OidcAdminRepository } from '@core/api/auth/oidc-admin.repository';
import { MatCard, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { NewSecretRequestData, SecretManagerNewSecretDialog } from './secret-manager-new-secret-dialog/secret-manager-new-secret-dialog.component';
import { SecretManagerShowSecretDialog } from './secret-manager-show-secret-dialog/secret-manager-show-secret-dialog.component';
import { SecretManagerDeleteSecretDialog } from './secret-manager-delete-secret-dialog/secret-manager-delete-secret-dialog.component';

export class SecretListChange {
    constructor(
      public source: SecretManagerComponent,
      public value: Secret[]) { }
}

@Component({
    selector: 'vw-secret-manager',
    templateUrl: './secret-manager.component.html',
    styleUrls: ['./secret-manager.component.css'],
    host: {
        'class': 'vw-secret-manager'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatCard, MatCardTitle, MatCardContent, MatIcon, MatCardActions, MatButton, DatePipe]
})

export class SecretManagerComponent implements OnChanges {
    private _changeDetectorRef = inject(ChangeDetectorRef);
    dialog = inject(MatDialog);
    private oidcAdminRepository = inject(OidcAdminRepository);

    private _valueList: Secret[] = [];
    private _isDeletingSecret: boolean = false;
    private _onLoadSource: () => Observable<Secret[]>;
    private _onDelete: (secretId: string) => Observable<void>;
    private _onGenerate: (req: NewSecretRequestData) => Observable<SecretResponse>;

    @Input() ownerId: string;
    @Input() ownerType: string;

    get value(): Secret[] { return this._valueList; }
    set value(value: Secret[]) {
        this._valueList = value;
        this._changeDetectorRef.markForCheck();
    }

    @Output() readonly reload: EventEmitter<void> = new EventEmitter<void>();

    ngOnChanges() {
        if (this.ownerType.toLowerCase() === 'client') {
            this._onLoadSource = () => this.oidcAdminRepository.getClientSecrets(this.ownerId);
            this._onDelete = (secretId: string) => this.oidcAdminRepository.deleteClientSecret(this.ownerId, secretId);
            this._onGenerate = (req: NewSecretRequestData) => this.oidcAdminRepository.createClientSecret(this.ownerId, { description: req.description, expiration: req.expiration })
        } else if (this.ownerType.toLowerCase() === 'resource') {
            this._onLoadSource = () => this.oidcAdminRepository.getApiResourceSecrets(this.ownerId);
            this._onDelete = (secretId: string) => this.oidcAdminRepository.deleteApiResourceSecret(this.ownerId, secretId);
            this._onGenerate = (req: NewSecretRequestData) => this.oidcAdminRepository.createApiResourceSecret(this.ownerId, { description: req.description, expiration: req.expiration })
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
                            this.value.push(secret.model);
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

