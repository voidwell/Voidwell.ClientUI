import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { getErrorMessage } from '@core/util/error-message';
import { CustomEventRepository } from '@core/api/platform/custom-event.repository';
import { CustomEvent } from '@core/api/models/platform/custom-event.model';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { EventCardComponent } from '../event-card/event-card.component';
import { NgArrayPipesModule } from 'ngx-pipes';

@Component({
    templateUrl: './planetside-events-list.component.html',
    styleUrls: ['./planetside-events-list.component.css'],
    imports: [LoaderComponent, ErrorCardComponent, EventCardComponent, NgArrayPipesModule]
})

export class PlanetsideEventsListComponent {
    private customEventRepository = inject(CustomEventRepository);
    private cdr = inject(ChangeDetectorRef);

    errorMessage: string = null;
    isLoading: boolean;

    private events: CustomEvent[] = [];

    constructor() {
        this.isLoading = true;
        this.events = [];

        this.customEventRepository.getEventsByGame("ps2")
            .pipe(catchError(error => {
                this.errorMessage = getErrorMessage(error);
                this.isLoading = false;
                this.cdr.markForCheck();
                return EMPTY;
            }))
            .subscribe(events => {
                this.events = events;

                this.isLoading = false;
                this.cdr.markForCheck();
            });
    }

    getActiveEvents() {
        const now = new Date();
        return this.events.filter(a => new Date(a.endDate) > now);
    }

    getPastEvents() {
        const now = new Date();
        return this.events.filter(a => new Date(a.endDate) <= now);
    }
}