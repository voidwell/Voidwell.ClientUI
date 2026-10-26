import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { MatSlideToggleChange, MatSlideToggle } from '@angular/material/slide-toggle';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlatformServiceState, ServiceState } from '@core/api/models/ps2/admin.model';
import { ServicesRepository } from '@core/api/ps2/services.repository';
import { getErrorMessage } from '@core/util/error-message';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { PlatformSectionComponent } from '@shared/ui/platform-section/platform-section.component';
import { PlatformGroup, groupByPlatform } from '@shared/utils/platforms';
import { MatCard } from '@angular/material/card';
import { JsonPipe } from '@angular/common';

/** A service of one Daybreak instance plus the UI state of its toggle. */
type ServiceRow = PlatformServiceState & { isLoading?: boolean; errorMessage?: string | null };

@Component({
    templateUrl: './services.component.html',
    styleUrls: ['./services.component.css'],
    imports: [LoaderComponent, ErrorMessageComponent, ErrorCardComponent, PlatformSectionComponent, MatCard, MatSlideToggle, JsonPipe]
})

export class ServicesComponent {
    private servicesRepository = inject(ServicesRepository);
    private cdr = inject(ChangeDetectorRef);

    isLoading: boolean;
    errorMessage: string;
    serviceGroups: PlatformGroup<ServiceRow>[] = [];

    /** The services whose details are open, as `platform/name`. */
    readonly open = signal<ReadonlySet<string>>(new Set());

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
                this.cdr.markForCheck();
            }))
            .subscribe(services => {
                this.serviceGroups = groupByPlatform(services);
            });
    }

    key(service: ServiceRow): string {
        return `${service.platform}/${service.name}`;
    }

    toggleDetails(service: ServiceRow) {
        this.open.update(open => {
            const next = new Set(open);
            const key = this.key(service);
            if (!next.delete(key)) {
                next.add(key);
            }
            return next;
        });
    }

    onServiceUpdate(service: ServiceRow, event: MatSlideToggleChange) {
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
                this.cdr.markForCheck();
            }))
            .subscribe(serviceState => {
                Object.assign(service, serviceState);
            });
    }
}
