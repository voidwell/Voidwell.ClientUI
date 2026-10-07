import { Component, inject, effect, input, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, FormControl, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { ApiResourceConfig, ApiResourceScope } from '@core/api/models/auth/oidc-api-resource.model';
import { OidcAdminRepository } from '@core/api/auth/oidc-admin.repository';
import { getErrorMessage } from '@core/util/error-message';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { MatCard, MatCardContent, MatCardTitle, MatCardActions } from '@angular/material/card';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { EntryListComponent } from '@shared/ui/entry-list/entry-list.component';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { SecretManagerComponent } from '../../secret-manager/secret-manager.component';
import { ApiResourceDetailsDeleteDialog } from './api-resource-details-delete-dialog/api-resource-details-delete-dialog.component';

const SCOPE_RGEX = /^[-a-z]*$/;

@Component({
    templateUrl: './api-resource-details.component.html',
    styleUrls: ['./api-resource-details.component.css'],
    imports: [LoaderComponent, ErrorMessageComponent, FormsModule, ReactiveFormsModule, MatCard, MatCardContent, MatSlideToggle, MatFormField, MatInput, EntryListComponent, MatCardTitle, MatIcon, MatCardActions, MatButton, SecretManagerComponent]
})
export class ApiResourceDetailsComponent {
    readonly resourceId = input<string>();
    private formBuilder = inject(FormBuilder);
    private oidcAdminRepository = inject(OidcAdminRepository);
    private router = inject(Router);
    dialog = inject(MatDialog);
    
    isLoading: boolean = true;
    errorMessage: string;
    resource: ApiResourceConfig;
    form: FormGroup;


    constructor() {
        effect(() => {
            const resourceId = this.resourceId();

            untracked(() => {

                this.loadResource(resourceId);
            });
        });
    }

    loadResource(resourceId: string) {
        this.isLoading = true;
        
        this.oidcAdminRepository.getApiResource(resourceId)
            .pipe(catchError(error => {
                this.errorMessage = getErrorMessage(error)
                return throwError(() => error);
            }))
            .pipe(finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(resource => {
                this.resource = resource;
                this.createForm(resource);
            });
    }

    onSubmit() {
        if (this.form.invalid) {
            return;
        }
    }

    createForm(config: ApiResourceConfig) {
        this.form = this.formBuilder.group({
            enabled: new FormControl(config.enabled),
            name: new FormControl(config.name),
            description: new FormControl(config.description),
            displayName: new FormControl(config.displayName),
            userClaims: new FormControl(config.userClaims || []),
            properties: new FormControl(config.properties || []),
            scopes: this.createScopesControls(config)
        });
    }

    get scopeControls(): FormGroup[] {
        return (this.form.controls['scopes'] as FormArray).controls as FormGroup[];
    }

    createScopesControls(config: ApiResourceConfig): FormArray {
        const scopeControls: FormGroup[] = [];

        if (config.scopes) {
            for(let i = 0; i < config.scopes.length; i++) {
                const scopeGroup = this.createScopeControl(config.scopes[i]);
                scopeControls.push(scopeGroup);
            }
        }

        return this.formBuilder.array(scopeControls);
    }

    createScopeControl(scope: ApiResourceScope): FormGroup {
        return this.formBuilder.group({
            name: new FormControl(scope.name),
            showInDiscoveryDocument: new FormControl(scope.showInDiscoveryDocument === undefined ? true : !!scope.showInDiscoveryDocument),
            displayName: new FormControl(scope.displayName),
            description: new FormControl(scope.description),
            required: new FormControl(!!scope.required),
            emphasize: new FormControl(!!scope.emphasize),
            userClaims: new FormControl(scope.userClaims || [])
        });
    }

    onDeleteScope(scope: AbstractControl) {
        const scopeGroups = this.form.controls['scopes'] as FormArray;
        const scopeIdx = scopeGroups.controls.indexOf(scope);
        scopeGroups.removeAt(scopeIdx);
    }

    onAddScope() {
        const scopeGroups = this.form.controls['scopes'] as FormArray;
        const newScope = this.createScopeControl(new ApiResourceScope());
        scopeGroups.push(newScope);
    }

    scopeValidation(value: string): boolean {
        return SCOPE_RGEX.test(value);
    }

    saveConfiguration() {
        const config = this.form.getRawValue();
        config.id = this.resource.id;
        this.oidcAdminRepository.updateApiResource(this.resource.name, config)
            .pipe(catchError(error => {
                this.errorMessage = getErrorMessage(error)
                return throwError(() => error);
            }))
            .subscribe(() => {
                this.router.navigateByUrl("admin/oidc/resources");
            });
    }

    deleteConfiguration() {
        this.dialog.open(ApiResourceDetailsDeleteDialog, {})
            .afterClosed().subscribe(confirmed => {
                if(!confirmed) {
                    return;
                }
                this.oidcAdminRepository.deleteApiResource(this.resource.name)
                    .pipe(catchError(error => {
                        this.errorMessage = getErrorMessage(error)
                        return throwError(() => error);
                    }))
                    .subscribe(() => {
                        this.router.navigateByUrl("admin/oidc/resources");
                    })
            });
    }

}

