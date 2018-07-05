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

    private alerts = [];

    constructor(private api: PlanetsideApi) {
        this.isLoading = true;
        this.alerts = [];

        this.api.getAllAlerts()
            .subscribe(alerts => {
                this.alerts = alerts;
                this.alerts.map(a => {
                    a.startDate = new Date(a.startDate);
                    a.endDate = a.endDate ? new Date(a.endDate) : null;
                    return a;
                });

                this.isLoading = false;
            });
    }

    getActiveAlerts() {
        let now = new Date();
        return this.alerts.filter(alert => this.getEndDate(alert) > now);
    }

    getPastAlerts() {
        let now = new Date();
        return this.alerts.filter(alert => this.getEndDate(alert) <= now);
    }

    private getEndDate(alert: any): Date {
        if (alert.endDate) {
            return new Date(alert.endDate);
        }

        let startString = alert.startDate;
        let startMs = new Date(startString).getTime();
        return new Date(startMs + 1000 * 60 * 45);
    }
}