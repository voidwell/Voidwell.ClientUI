import { Component, OnDestroy, forwardRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { VoidwellApi } from './../../../shared/services/voidwell-api.service';
import { PlanetsideCombatEventComponent } from './../../combat-event/planetside-combat-event.component';

@Component({
    templateUrl: './planetside-event.template.html',
    styleUrls: ['./planetside-event.styles.css'],
    providers: [ {provide: PlanetsideCombatEventComponent, useExisting: forwardRef(() => PlanetsideEventComponent) }]
})

export class PlanetsideEventComponent extends PlanetsideCombatEventComponent implements OnDestroy {
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

    constructor(private api: VoidwellApi, private route: ActivatedRoute) {
        super();

        this.sub = this.route.params.subscribe(params => {
            let eventId = params['eventId'];

            this.isLoading = true;
            this.errorMessage = null;
            this.activeEvent = null;

            this.event.next(null);

            this.api.getCustomEvent(eventId)
                .pipe<any>(catchError(error => {
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
        let startString = alert.startDate;
        let startMs = new Date(startString).getTime();
        return new Date(startMs + 1000 * 60 * 90);
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }
}