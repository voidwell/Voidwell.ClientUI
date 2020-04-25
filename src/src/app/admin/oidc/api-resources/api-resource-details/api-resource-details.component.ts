import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, throwError, Observable } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VoidwellApi } from '../../../../shared/services/voidwell-api.service';
import { NewSecretRequestData } from '../../secret-manager/secret-manager.component';
import { Secret } from '../../models/secret.model';

const SCOPE_RGEX = /^[-a-z]*$/;

@Component({
    templateUrl: './api-resource-details.template.html',
    styleUrls: ['./api-resource-details.styles.css']
})
export class ApiResourceDetailsComponent implements OnInit, OnDestroy {    
    isLoading: boolean;
    errorMessage: string;
    resource: any;
    form: FormGroup;

    private routeSub: Subscription;

    secretGenerateCallback: Function;
    secretDeleteCallback: Function;

    constructor(private route: ActivatedRoute, private formBuilder: FormBuilder, private api: VoidwellApi, private router: Router, public dialog: MatDialog) {
        this.isLoading = true;

        this.routeSub = this.route.params.subscribe(params => {
            let resourceId = params['resourceId'];

            this.loadResource(resourceId);
        });
    }

    ngOnInit() {
        this.secretGenerateCallback = this.generateSecret.bind(this);
        this.secretDeleteCallback = this.deleteSecret.bind(this);
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
            scopes: new FormControl(config.scopes || [])
        });
    }

    scopeValidation(value: string): boolean {
        return SCOPE_RGEX.test(value);
    }

    generateSecret(request: NewSecretRequestData): Observable<string> {
        return this.api.createApiResourceSecret(this.resource.name, { description: request.description, expiration: request.expiration }); 
    }

    deleteSecret(secretId: string): Observable<any> {
        return this.api.deleteApiResourceSecret(this.resource.name, secretId);
    }

    secretLoad(): Observable<any> {
        return this.api.getApiResourceSecrets(this.resource.name);
    }

    reload() {
        this.loadResource(this.resource.name);
    }

    saveConfiguration() {
        let config = this.form.getRawValue();
        config.id = this.resource.id;
        this.api.updateApiResourceById(this.resource.name, config)
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