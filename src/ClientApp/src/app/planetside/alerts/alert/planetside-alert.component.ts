import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PlanetsideApi } from './../../planetside-api.service';
import { PlanetsideCombatEventComponent } from './../../combat-event/planetside-combat-event.component';

@Component({
    templateUrl: './planetside-alert.template.html',
    styleUrls: ['./planetside-alert.styles.css'],
    providers: [PlanetsideCombatEventComponent]
})

export class PlanetsideAlertComponent extends PlanetsideCombatEventComponent implements OnDestroy {
    isLoading: boolean = true;
    errorMessage: string = null;

    private sub: any;
    private navLinks = [
        { path: 'players', display: 'Players' },
        { path: 'outfits', display: 'Outfits' },
        { path: 'weapons', display: 'Weapons' },
        { path: 'vehicles', display: 'Vehicles' },
        { path: 'map', display: 'Map' }
    ];

    constructor(private api: PlanetsideApi, private route: ActivatedRoute) {
        super();
        this.sub = this.route.params.subscribe(params => {
            let worldId = params['worldId'];
            let instanceId = params['instanceId'];

            this.isLoading = true;
            this.errorMessage = null;
            this.activeEvent = null;

            this.event.next(null);

            this.api.getAlert(worldId, instanceId)
                .pipe(catchError(error => {
                    this.errorMessage = error._body
                    this.isLoading = false;
                    return throwError(error);
                }))
                .subscribe(data => this.setup(data));
        });
    }

    private setup(data: any) {
        this.event.next(data);
        this.activeEvent = data;
        this.isLoading = false;
    }

    private getEndDate(alert: any): Date {
        if (alert.endDate) {
            return new Date(alert.endDate);
        }

        let startString = alert.startDate;
        let startMs = new Date(startString).getTime();
        return new Date(startMs + 1000 * 60 * 45);
    }

    private isActive(alert: any): boolean {
        let endDate = this.getEndDate(alert);
        return endDate > new Date();
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }
}