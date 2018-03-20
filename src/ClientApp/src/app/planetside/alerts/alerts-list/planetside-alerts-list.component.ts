import { Component, OnDestroy } from '@angular/core';
import { PlanetsideApi } from './../../planetside-api.service';

@Component({
    templateUrl: './planetside-alerts-list.template.html',
    styleUrls: ['./planetside-alerts-list.styles.css'],
    providers: [PlanetsideApi]
})

export class PlanetsideAlertsListComponent {
    errorMessage: string = null;
    isLoading: boolean;

    private activeAlerts = [];
    private pastAlerts = [];

    constructor(private api: PlanetsideApi) {
        this.isLoading = true;
        this.activeAlerts = [];
        this.pastAlerts = [];

        this.api.getAllAlerts()
            .subscribe(alerts => {
                for (let i = 0; i < alerts.length; i++) {
                    if (alerts[i].endDate) {
                        this.pastAlerts.push(alerts[i]);
                    } else {
                        this.activeAlerts.push(alerts[i]);
                    }
                }

                this.isLoading = false;
            });
    }

    private getEndDate(alert: any): Date {
        let startString = alert.startDate;
        let startMs = new Date(startString).getTime();
        return new Date(startMs + 1000 * 60 * 45);
    }
}