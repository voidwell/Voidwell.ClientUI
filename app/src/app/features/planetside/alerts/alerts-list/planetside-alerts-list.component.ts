import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { WorldService } from '../../data/world.service';
import { AlertRepository } from '@core/api/ps2/alert.repository';
import { AlertView, toAlertView } from '../../components/alert-card/alert-view';
import { MatButtonToggleChange, MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { AlertCardComponent } from '../../components/alert-card/alert-card.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgArrayPipesModule } from 'ngx-pipes';

@Component({
    templateUrl: './planetside-alerts-list.component.html',
    styleUrls: ['./planetside-alerts-list.component.css'],
    imports: [AlertCardComponent, ErrorMessageComponent, MatButtonToggleGroup, MatButtonToggle, MatButton, MatIcon, NgArrayPipesModule]
})

export class PlanetsideAlertsListComponent {
    private alertRepository = inject(AlertRepository);
    private cdr = inject(ChangeDetectorRef);
    worldService = inject(WorldService);

    errorMessage: string = null;
    isLoading: boolean;
    pageNumber = 0;

    private alerts: AlertView[] = [];
    private firstPageAlerts: AlertView[] = [];
    private pageWorldId: number | null;

    constructor() {
        this.alerts = [];
        this.firstPageAlerts = [];

        this.loadAlertsPage();
    }

    getActiveAlerts() {
        const now = new Date();
        return this.firstPageAlerts.filter(alert => this.getEndDate(alert) > now);
    }

    getPastAlerts() {
        const now = new Date();
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

    onFilterChange(event: MatButtonToggleChange) {
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

        this.alertRepository.getAlerts(this.pageNumber, this.pageWorldId || undefined)
            .subscribe(alerts => {
                this.alerts = alerts.map(toAlertView);

                if (this.pageNumber === 0 && !this.pageWorldId) {
                    this.firstPageAlerts = this.alerts.slice();
                }

                this.isLoading = false;
                this.cdr.markForCheck();
            });
    }

    private getEndDate(alert: AlertView): Date {
        if (alert.endDate) {
            return new Date(alert.endDate);
        }

        const startString = alert.startDate;
        const startMs = new Date(startString).getTime();
        return new Date(startMs + 1000 * 60 * 45);
    }
}