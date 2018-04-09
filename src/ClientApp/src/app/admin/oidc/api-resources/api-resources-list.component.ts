import { Component } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material';
import { VoidwellApi } from './../../../shared/services/voidwell-api.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/finally'
import 'rxjs/add/observable/throw';

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
            .catch(error => {
                this.errorMessage = error._body
                return Observable.throw(error);
            })
            .finally(() => {
                this.isLoading = false;
            })
            .subscribe(apiResources => {
                this.apiResources = apiResources;
            });
    }
}