import { Component } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material';
import { VoidwellApi } from '../shared/services/voidwell-api.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/finally'
import 'rxjs/add/observable/throw';

@Component({
    templateUrl: './services.template.html'
})

export class ServicesComponent {
    isLoading: boolean;
    errorMessage: string;
    planetsideServices: any[] = [];

    constructor(private api: VoidwellApi) {
        this.isLoading = true;
        this.errorMessage = null;

        this.api.getPS2AllServiceStatus()
            .catch(error => {
                this.errorMessage = error._body
                return Observable.throw(error);
            })
            .finally(() => {
                this.isLoading = false;
            })
            .subscribe(services => {
                this.planetsideServices = services;
            });
    }

    private onServiceUpdate(service: any, event: MatSlideToggleChange) {
        service.isLoading = true;
        service.errorMessage = null;

        let serviceRequest: Observable<any> = null;

        if (event.checked) {
            serviceRequest = this.api.enablePS2Service(service.name);
        } else {
            serviceRequest = this.api.disablePS2Service(service.name);
        }

        serviceRequest
            .catch(error => {
                service.errorMessage = error._body
                event.source.checked = !event.checked;
                return Observable.throw(error);
            })
            .finally(() => {
                service.isLoading = false;
            })
            .subscribe(serviceState => {
                Object.assign(service, serviceState);
            });
    }
}