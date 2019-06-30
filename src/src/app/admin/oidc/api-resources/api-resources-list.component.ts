import { Component } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { VoidwellApi } from './../../../shared/services/voidwell-api.service';

@Component({
    templateUrl: './api-resources-list.template.html'
})

export class ApiResourcesListComponent {
    isLoading: boolean;
    errorMessage: string;
    apiResources: any[] = [];

    constructor(private api: VoidwellApi) {
        this.isLoading = true;
        this.errorMessage = null;

        this.api.getAllApiResources()
            .pipe<any>(catchError(error => {
                this.errorMessage = error._body
                return throwError(error);
            }))
            .pipe<any>(finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(apiResources => {
                this.apiResources = apiResources;
            });
    }
}