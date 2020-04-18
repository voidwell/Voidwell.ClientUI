import { Component, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Subscription, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { VoidwellApi } from './../../../../shared/services/voidwell-api.service';

const GRANT_TYPES = [
    "delegation",
    "client_credentials",
    "implicit"
];

const SCOPE_RGEX = /^[-a-z]*$/;

@Component({
    templateUrl: './client-details.template.html',
    styleUrls: ['./client-details.styles.css']
})
export class ClientDetailsComponent implements OnDestroy {
    isLoading: boolean;
    errorMessage: string;
    client: any;
    form: FormGroup;

    private routeSub: Subscription;

    constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private api: VoidwellApi, public dialog: MatDialog, private router: Router) {
        this.isLoading = true;

        this.routeSub = this.route.params.subscribe(params => {
            let clientId = params['clientId'];

            this.loadClient(clientId);
        });
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
        let allowedGrantTypes = this.formBuilder.array(GRANT_TYPES.map(t => new FormControl({selected: config.allowedGrantTypes.indexOf(t) > -1, name: t})));

        this.form = this.formBuilder.group({
            enabled: new FormControl(config.enabled),
            clientId: new FormControl(config.clientId),
            clientName: new FormControl(config.clientName),
            clientSecrets: new FormControl(config.clientSecrets),
            requireClientSecret: new FormControl(config.requireClientSecret),
            description: new FormControl(config.description),
            allowedGrantTypes: allowedGrantTypes,
            requirePkce: new FormControl(config.requirePkce),
            allowPlainTextPkce: new FormControl(config.allowPlanTextPkce),
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
            includeJwtId: new FormControl(config.includeJwtId),

            scopeInput: new FormControl(),
            redirectUriInput: new FormControl(),
            postLogoutRedirectUriInput: new FormControl(),
            allowedCorsOriginsInput: new FormControl(),
            claimsInput: new FormControl()
        });
    }

    scopeValidation(value: string): boolean {
        return SCOPE_RGEX.test(value);
    }

    generateSecret() {
        const generateDialogRef = this.dialog.open(ClientDetailsNewSecretDialog, {});
    
        generateDialogRef.afterClosed().subscribe((result: NewSecretDialogData) => {
            this.api.createClientSecret(this.client.clientId, { description: result.description })
                .pipe<any>(catchError(error => {
                    this.errorMessage = error._body
                    return throwError(error);
                }))
                .subscribe(secret => {
                    const displayDialogRef = this.dialog.open(ClientDetailsShowSecretDialog, {
                        data: { secret: secret }
                    });

                    displayDialogRef.afterClosed().subscribe(() => {
                        this.loadClient(this.client.clientId);
                    });
                }); 
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}

export class NewSecretDialogData {
    description: string;
    expiration: string;
}

@Component({
    selector: 'client-details-new-secret-dialog',
    templateUrl: 'client-details-new-secret-dialog.html',
})
export class ClientDetailsNewSecretDialog {
    data: NewSecretDialogData = new NewSecretDialogData();

    constructor(
        public dialogRef: MatDialogRef<ClientDetailsNewSecretDialog>) {}

    onNoClick(): void {
        this.dialogRef.close();
    }
}

@Component({
    selector: 'client-details-show-secret-dialog',
    templateUrl: 'client-details-show-secret-dialog.html',
})
export class ClientDetailsShowSecretDialog {
    constructor(
        public dialogRef: MatDialogRef<ClientDetailsNewSecretDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) {}

    onNoClick(): void {
        this.dialogRef.close();
    }
}