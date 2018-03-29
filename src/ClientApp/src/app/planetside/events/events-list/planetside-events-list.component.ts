import { Component, OnDestroy } from '@angular/core';
import { VoidwellApi } from './../../../shared/services/voidwell-api.service';

@Component({
    templateUrl: './planetside-events-list.template.html',
    styleUrls: ['./planetside-events-list.styles.css'],
    providers: [VoidwellApi]
})

export class PlanetsideEventsListComponent {
    errorMessage: string = null;
    isLoading: boolean;

    private events = [];

    constructor(private api: VoidwellApi) {
        this.isLoading = true;
        this.events = [];

        this.api.getCustomEventsByGame("ps2")
            .subscribe(events => {
                this.events = events;
                this.events.map(a => {
                    a.startDate = new Date(a.startDate);
                    a.endDate = a.endDate ? new Date(a.endDate) : null;
                    return a;
                });

                this.isLoading = false;
            });
    }

    getActiveEvents() {
        let now = new Date();
        return this.events.filter(a => a.endDate > now);
    }

    getPastEvents() {
        let now = new Date();
        return this.events.filter(a => a.endDate <= now);
    }
}