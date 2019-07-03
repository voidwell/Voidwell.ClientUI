import { Component } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { VoidwellApi } from './../../shared/services/voidwell-api.service';

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
            .pipe<any>(catchError(error => {
                this.errorMessage = error._body
                return throwError(error);
            }))
            .pipe<any>(finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(services => {
                this.planetsideServices = services;
            });
    }

    private onServiceUpdate(service: any, event: MatSlideToggleChange) {
        service.isLoading = true;
        service.errorMessage = null;

        let serviceRequest: Observable<any> = null;

        if (event.checked) {
            serviceRequest = this.api.enablePS2Service(service.name, service.originator);
        } else {
            serviceRequest = this.api.disablePS2Service(service.name, service.originator);
        }

        serviceRequest
            .pipe<any>(catchError(error => {
                service.errorMessage = error._body
                event.source.checked = !event.checked;
                return throwError(error);
            }))
            .pipe<any>(finalize(() => {
                service.isLoading = false;
            }))
            .subscribe(serviceState => {
                Object.assign(service, serviceState);
            });
    }
}