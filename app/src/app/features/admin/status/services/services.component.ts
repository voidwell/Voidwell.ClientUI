import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { MatSlideToggleChange, MatSlideToggle } from '@angular/material/slide-toggle';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlatformServiceState, ServiceState } from '@core/api/models/ps2/admin.model';
import { ServicesRepository } from '@core/api/ps2/services.repository';

/** A service of one Daybreak instance plus the UI state of its toggle. */
type ServiceRow = PlatformServiceState & { isLoading?: boolean; errorMessage?: string | null };
import { getErrorMessage } from '@core/util/error-message';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { JsonPipe } from '@angular/common';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './services.component.html',
    imports: [LoaderComponent, ErrorMessageComponent, MatCard, MatCardHeader, MatCardTitle, MatSlideToggle, MatCardContent, JsonPipe]
})

export class ServicesComponent {
    private servicesRepository = inject(ServicesRepository);

    isLoading: boolean;
    errorMessage: string;
    planetsideServices: ServiceRow[] = [];

    constructor() {
        this.isLoading = true;
        this.errorMessage = null;

        this.servicesRepository.getAllStatuses()
            .pipe(catchError(error => {
                this.errorMessage = getErrorMessage(error)
                return throwError(() => error);
            }))
            .pipe(finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(services => {
                this.planetsideServices = services;
            });
    }

    private onServiceUpdate(service: ServiceRow, event: MatSlideToggleChange) {
        service.isLoading = true;
        service.errorMessage = null;

        let serviceRequest: Observable<ServiceState>;

        if (event.checked) {
            serviceRequest = this.servicesRepository.enable(service.name, service.platform);
        } else {
            serviceRequest = this.servicesRepository.disable(service.name, service.platform);
        }

        serviceRequest
            .pipe(catchError(error => {
                service.errorMessage = getErrorMessage(error)
                event.source.checked = !event.checked;
                return throwError(() => error);
            }))
            .pipe(finalize(() => {
                service.isLoading = false;
            }))
            .subscribe(serviceState => {
                Object.assign(service, serviceState);
            });
    }
}