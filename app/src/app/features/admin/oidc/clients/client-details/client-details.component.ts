import { Component, inject, effect, input, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ClientConfig } from '@core/api/models/auth/oidc-client.model';
import { OidcAdminRepository } from '@core/api/auth/oidc-admin.repository';
import { getErrorMessage } from '@core/util/error-message';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelectionList, MatListOption } from '@angular/material/list';
import { EntryListComponent } from '@shared/ui/entry-list/entry-list.component';
import { MatSelect, MatOption } from '@angular/material/select';
import { SecretManagerComponent } from '../../secret-manager/secret-manager.component';
import { MatButton } from '@angular/material/button';
import { ClientDetailsDeleteDialog } from './client-details-delete-dialog/client-details-delete-dialog.component';

const SCOPE_RGEX = /^[-a-z]*$/;

@Component({
    templateUrl: './client-details.component.html',
    styleUrls: ['./client-details.component.css'],
    imports: [LoaderComponent, ErrorMessageComponent, FormsModule, ReactiveFormsModule, MatCard, MatCardContent, MatSlideToggle, MatFormField, MatInput, MatSelectionList, MatListOption, EntryListComponent, MatSelect, MatOption, SecretManagerComponent, MatCardActions, MatButton]
})
export class ClientDetailsComponent {
    readonly clientId = input<string>();
    private formBuilder = inject(FormBuilder);
    private oidcAdminRepository = inject(OidcAdminRepository);
    private router = inject(Router);
    dialog = inject(MatDialog);
    
    isLoading: boolean = true;
    errorMessage: string;
    client: ClientConfig;
    form: FormGroup;

    GRANT_TYPES = [
        "delegation",
        "client_credentials",
        "implicit"
    ];


    constructor() {
        effect(() => {
            const clientId = this.clientId();

            untracked(() => {

                this.loadClient(clientId);
            });
        });
    }

    loadClient(clientId: string) {        
        this.isLoading = true;
        this.oidcAdminRepository.getClient(clientId)
            .pipe(catchError(error => {
                this.errorMessage = getErrorMessage(error)
                return throwError(() => error);
            }))
            .pipe(finalize(() => {
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

    createForm(config: ClientConfig) {
        this.form = this.formBuilder.group({
            enabled: new FormControl(config.enabled),
            clientId: new FormControl(config.clientId),
            clientName: new FormControl(config.clientName),
            requireClientSecret: new FormControl(config.requireClientSecret),
            description: new FormControl(config.description),
            allowedGrantTypes: new FormControl(config.allowedGrantTypes),
            requirePkce: new FormControl(config.requirePkce),
            allowPlainTextPkce: new FormControl(config.allowPlainTextPkce || false),
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

    saveConfiguration() {
        const config = this.form.getRawValue();
        config.id = this.client.id;
        this.oidcAdminRepository.updateClient(this.client.clientId, config)
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
                this.oidcAdminRepository.deleteClient(this.client.clientId)
                    .subscribe(() => {
                        this.router.navigateByUrl("admin/oidc/clients");
                    })
            });
    }

}

