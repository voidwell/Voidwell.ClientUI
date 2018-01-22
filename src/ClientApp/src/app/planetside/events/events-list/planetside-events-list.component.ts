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

    private activeEvents = [];
    private pastEvents = [];

    constructor(private api: VoidwellApi) {
        this.isLoading = true;
        this.activeEvents = [];
        this.pastEvents = [];

        this.api.getCustomEventsByGame("ps2")
            .subscribe(events => {
                for (let i = 0; i < events.length; i++) {
                    if (events[i].endDate) {
                        this.pastEvents.push(events[i]);
                    } else {
                        this.activeEvents.push(events[i]);
                    }
                }

                this.isLoading = false;
            });
    }

    private getEndDate(event: any): Date {
        let startString = event.startDate;
        let startMs = new Date(startString).getTime();
        return new Date(startMs + 1000 * 60 * 90);
    }
}