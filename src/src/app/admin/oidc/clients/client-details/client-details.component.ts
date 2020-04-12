import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { VoidwellApi } from './../../../../shared/services/voidwell-api.service';

const GRANT_TYPES = [
    "delegation",
    "client_credentials",
    "implicit"
];

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

    constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private api: VoidwellApi) {
        this.isLoading = true;

        this.routeSub = this.route.params.subscribe(params => {
            let clientId = params['clientId'];
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
            redirectUris: this.formBuilder.array(config.redirectUris.map(t => new FormControl(t))),
            postLogoutRedirectUris: this.formBuilder.array(config.postLogoutRedirectUris.map(t => new FormControl(t))),
            frontChannelLogoutUri: new FormControl(config.frontChannelLogoutUri),
            frontChannelLogoutSessionRequired: new FormControl(config.frontChannelLogoutSessionRequired),
            backChannelLogoutUri: new FormControl(config.backChannelLogoutUri),
            backChannelLogoutSessionRequired: new FormControl(config.backChannelLogoutSessionRequired),
            allowOfflineAccess: new FormControl(config.allowOfflineAccess),
            allowedScopes: this.formBuilder.array(config.allowedScopes.map(t => new FormControl(t))),
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
            claims: this.formBuilder.array(config.claims.map(t => new FormControl(t))),
            alwaysSendClientClaims: new FormControl(config.alwaysSendClientClaims),
            clientClaimsPrefix: new FormControl(config.clientClaimsPrefix),
            allowedCorsOrigins: this.formBuilder.array(config.allowedCorsOrigins.map(t => new FormControl(t))),
            includeJwtId: new FormControl(config.includeJwtId),

            scopeInput: new FormControl(),
            redirectUriInput: new FormControl(),
            postLogoutRedirectUriInput: new FormControl(),
            allowedCorsOriginsInput: new FormControl(),
            claimsInput: new FormControl()
        });
    }

    removeFromControlList(control) {
        control.parent.removeAt(control.parent.controls.indexOf(control));
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}