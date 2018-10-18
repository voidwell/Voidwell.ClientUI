import { Component, OnDestroy } from '@angular/core';
import { PlanetsideApi } from './../../shared/services/planetside-api.service';
import { WorldService } from '../../shared/services/world-service.service';

@Component({
    templateUrl: './planetside-alerts-list.template.html',
    styleUrls: ['./planetside-alerts-list.styles.css'],
    providers: [PlanetsideApi]
})

export class PlanetsideAlertsListComponent {
    errorMessage: string = null;
    isLoading: boolean;
    pageNumber = 0;

    private alerts = [];
    private firstPageAlerts = [];
    private pageWorldId;

    constructor(private api: PlanetsideApi, private worldService: WorldService) {
        this.alerts = [];
        this.firstPageAlerts = [];

        this.loadAlertsPage();
    }

    getActiveAlerts() {
        let now = new Date();
        return this.firstPageAlerts.filter(alert => this.getEndDate(alert) > now);
    }

    getPastAlerts() {
        let now = new Date();
        return this.alerts.filter(alert => this.getEndDate(alert) <= now);
    }

    nextAlerts() {
        this.pageNumber++;
        this.loadAlertsPage();
    }

    previousAlerts() {
        this.pageNumber--;
        this.loadAlertsPage();
    }

    onFilterChange(event) {
        this.pageNumber = 0;

        if (!event.value) {
            this.pageWorldId = null;
        } else {
            this.pageWorldId = parseInt(event.value);
        }

        this.loadAlertsPage();
    }

    private loadAlertsPage() {
        this.isLoading = true;

        let alertsReq;
        if (this.pageWorldId) {
            alertsReq = this.api.getAlertsByWorldId(this.pageNumber, this.pageWorldId);
        } else {
            alertsReq = this.api.getAlerts(this.pageNumber);
        }

        alertsReq.subscribe(alerts => {
                this.alerts = alerts;
                this.alerts.map(a => {
                    a.startDate = new Date(a.startDate);
                    a.endDate = a.endDate ? new Date(a.endDate) : null;
                    return a;
                });

                if (this.pageNumber === 0 && !this.pageWorldId) {
                    this.firstPageAlerts = this.alerts.slice();
                }

                this.isLoading = false;
            });
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