import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CustomEventRepository } from '@core/api/platform/custom-event.repository';
import { CustomEvent } from '@core/api/models/platform/custom-event.model';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { EventCardComponent } from '../event-card/event-card.component';
import { NgArrayPipesModule } from 'ngx-pipes';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './planetside-events-list.component.html',
    styleUrls: ['./planetside-events-list.component.css'],
    imports: [LoaderComponent, ErrorMessageComponent, EventCardComponent, NgArrayPipesModule]
})

export class PlanetsideEventsListComponent {
    private customEventRepository = inject(CustomEventRepository);

    errorMessage: string = null;
    isLoading: boolean;

    private events: CustomEvent[] = [];

    constructor() {
        this.isLoading = true;
        this.events = [];

        this.customEventRepository.getEventsByGame("ps2")
            .subscribe(events => {
                this.events = events;

                this.isLoading = false;
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