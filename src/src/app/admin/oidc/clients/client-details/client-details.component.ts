import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, throwError, Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VoidwellApi } from './../../../../shared/services/voidwell-api.service';
import { NewSecretRequestData } from '../../secret-manager/secret-manager.component';
import { Secret } from '../../models/secret.model';

const SCOPE_RGEX = /^[-a-z]*$/;

@Component({
    templateUrl: './client-details.template.html',
    styleUrls: ['./client-details.styles.css']
})
export class ClientDetailsComponent implements OnInit, OnDestroy {    
    isLoading: boolean;
    errorMessage: string;
    client: any;
    form: FormGroup;

    GRANT_TYPES = [
        "delegation",
        "client_credentials",
        "implicit"
    ];

    private routeSub: Subscription;

    secretGenerateCallback: Function;
    secretDeleteCallback: Function;

    constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private api: VoidwellApi, private router: Router, public dialog: MatDialog) {
        this.isLoading = true;

        this.routeSub = this.route.params.subscribe(params => {
            let clientId = params['clientId'];

            this.loadClient(clientId);
        });
    }

    ngOnInit() {
        this.secretGenerateCallback = this.generateSecret.bind(this);
        this.secretDeleteCallback = this.deleteSecret.bind(this);
    }

    loadClient(clientId: string) {
        this.isLoading = true;
        
        this.api.getClientById(clientId)
            .pipe<any>(catchError(error => {
                this.errorMessage = error._body
                return throwError(error);
            }))
            .pipe<any>(finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(client => {
                this.client = client;
                this.createForm(client);
            });
    }

    onSubmit() {
        if (this.form.invalid) {
            return;
        }
    }

    createForm(config) {
        this.form = this.formBuilder.group({
            enabled: new FormControl(config.enabled),
            clientId: new FormControl(config.clientId),
            clientName: new FormControl(config.clientName),
            requireClientSecret: new FormControl(config.requireClientSecret),
            description: new FormControl(config.description),
            allowedGrantTypes: new FormControl(config.allowedGrantTypes),
            requirePkce: new FormControl(config.requirePkce),
            allowPlainTextPkce: new FormControl(config.allowPlanTextPkce || false),
            allowAccessTokensViaBrowser: new FormControl(config.allowAccessTokensViaBrowser),
            redirectUris: new FormControl(config.redirectUris || []),
            postLogoutRedirectUris: new FormControl(config.postLogoutRedirectUris || []),
            frontChannelLogoutUri: new FormControl(config.frontChannelLogoutUri),
            frontChannelLogoutSessionRequired: new FormControl(config.frontChannelLogoutSessionRequired),
            backChannelLogoutUri: new FormControl(config.backChannelLogoutUri),
            backChannelLogoutSessionRequired: new FormControl(config.backChannelLogoutSessionRequired),
            allowOfflineAccess: new FormControl(config.allowOfflineAccess),
            allowedScopes: new FormControl(config.allowedScopes || []),
            alwaysIncludeUserClaimsInIdToken: new FormControl(config.alwaysIncludeUserClaimsInIdToken),
            identityTokenLifetime: new FormControl(config.identityTokenLifetime),
            accessTokenLifetime: new FormControl(config.accessTokenLifetime),
            authorizationCodeLifetime: new FormControl(config.authorizationCodeLifetime),
            absoluteRefreshTokenLifetime: new FormControl(config.absoluteRefreshTokenLifetime),
            slidingRefreshTokenLifetime: new FormControl(config.slidingRefreshTokenLifetime),
            refreshTokenUsage: new FormControl(config.refreshTokenUsage.toString()),
            updateAccessTokenClaimsOnRefresh: new FormControl(config.updateAccessTokenClaimsOnRefresh),
            refreshTokenExpiration: new FormControl(config.refreshTokenExpiration.toString()),
            accessTokenType: new FormControl(config.accessTokenType.toString()),
            enableLocalLogin: new FormControl(config.enableLocalLogin),
            claims: new FormControl(config.claims),
            alwaysSendClientClaims: new FormControl(config.alwaysSendClientClaims),
            clientClaimsPrefix: new FormControl(config.clientClaimsPrefix),
            allowedCorsOrigins: new FormControl(config.allowedCorsOrigins),
            includeJwtId: new FormControl(config.includeJwtId)
        });
    }

    scopeValidation(value: string): boolean {
        return SCOPE_RGEX.test(value);
    }

    generateSecret(request: NewSecretRequestData): Observable<string> {
        return this.api.createClientSecret(this.client.clientId, { description: request.description, expiration: request.expiration }); 
    }

    deleteSecret(secretId: string): Observable<any> {
        return this.api.deleteClientSecret(this.client.clientId, secretId);
    }

    secretLoad(): Observable<any> {
        return this.api.getClientSecrets(this.client.clientId);
    }

    reload() {
        this.loadClient(this.client.clientId);
    }

    saveConfiguration() {
        let config = this.form.getRawValue();
        config.id = this.client.id;
        this.api.updateClientById(this.client.clientId, config)
            .subscribe(() => {
                this.router.navigateByUrl("admin/oidc/clients");
            });
    }

    deleteConfiguration() {
        this.dialog.open(ClientDetailsDeleteDialog, {})
            .afterClosed().subscribe(confirmed => {
                if(!confirmed) {
                    return;
                }
                this.api.deleteClientById(this.client.clientId)
                    .subscribe(() => {
                        this.router.navigateByUrl("admin/oidc/clients");
                    })
            });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}

@Component({
    selector: 'client-details-delete-dialog',
    templateUrl: 'client-details-delete-dialog.html',
})
export class ClientDetailsDeleteDialog {
    constructor(
        public dialogRef: MatDialogRef<ClientDetailsDeleteDialog>) {}
}