import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, FormArray } from '@angular/forms';
import { Subscription, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VoidwellApi } from '../../../../shared/services/voidwell-api.service';

const SCOPE_RGEX = /^[-a-z]*$/;

@Component({
    templateUrl: './api-resource-details.template.html',
    styleUrls: ['./api-resource-details.styles.css']
})
export class ApiResourceDetailsComponent implements OnDestroy {    
    isLoading: boolean = true;
    errorMessage: string;
    resource: any;
    form: FormGroup;

    private routeSub: Subscription;

    constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private api: VoidwellApi, private router: Router, public dialog: MatDialog) {
        this.routeSub = this.route.params.subscribe(params => {
            let resourceId = params['resourceId'];

            this.loadResource(resourceId);
        });
    }

    loadResource(resourceId: string) {
        this.isLoading = true;
        
        this.api.getApiResourceById(resourceId)
            .pipe<any>(catchError(error => {
                this.errorMessage = error._body
                return throwError(error);
            }))
            .pipe<any>(finalize(() => {
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

    createForm(config) {
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

    createScopesControls(config): FormArray {
        let scopeControls = [];

        if (config.scopes) {
            for(let i = 0; i < config.scopes.length; i++) {
                let scopeGroup = this.createScopeControl(config.scopes[i]);
                scopeControls.push(scopeGroup);
            }
        }

        return this.formBuilder.array(scopeControls);
    }

    createScopeControl(scope): FormGroup {
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

    onDeleteScope(scope) {
        let scopeGroups = this.form.controls['scopes'] as FormArray;
        let scopeIdx = scopeGroups.controls.indexOf(scope);
        scopeGroups.removeAt(scopeIdx);
    }

    onAddScope() {
        let scopeGroups = this.form.controls['scopes'] as FormArray;
        let newScope = this.createScopeControl({});
        scopeGroups.push(newScope);
    }

    scopeValidation(value: string): boolean {
        return SCOPE_RGEX.test(value);
    }

    saveConfiguration() {
        let config = this.form.getRawValue();
        config.id = this.resource.id;
        this.api.updateApiResourceById(this.resource.name, config)
            .pipe<any>(catchError(error => {
                this.errorMessage = error._body
                return throwError(error);
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
                this.api.deleteApiResourceById(this.resource.name)
                    .pipe<any>(catchError(error => {
                        this.errorMessage = error._body
                        return throwError(error);
                    }))
                    .subscribe(() => {
                        this.router.navigateByUrl("admin/oidc/resources");
                    })
            });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}

@Component({
    selector: 'api-resource-details-delete-dialog',
    templateUrl: 'api-resource-details-delete-dialog.html',
})
export class ApiResourceDetailsDeleteDialog {
    constructor(
        public dialogRef: MatDialogRef<ApiResourceDetailsDeleteDialog>) {}
}