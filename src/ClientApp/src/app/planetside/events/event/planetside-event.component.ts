import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeaderService } from '../../../shared/services/header.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { VoidwellApi } from './../../../shared/services/voidwell-api.service';
import { PlanetsideCombatEventComponent } from './../../combat-event/planetside-combat-event.component';

@Component({
    templateUrl: './planetside-event.template.html',
    styleUrls: ['./planetside-event.styles.css']
})

export class PlanetsideEventComponent extends PlanetsideCombatEventComponent implements OnDestroy {
    private isLoading: boolean = true;
    private errorMessage: string = null;
    private sub: any;
    private navLinks = [
        { path: 'players', display: 'Players' },
        { path: 'outfits', display: 'Outfits' },
        { path: 'weapons', display: 'Weapons' },
        { path: 'vehicles', display: 'Vehicles' },
        { path: 'map', display: 'Map' }
    ];

    constructor(private api: VoidwellApi, private route: ActivatedRoute, private headerService: HeaderService) {
        super(headerService);

        this.sub = this.route.params.subscribe(params => {
            let eventId = params['eventId'];

            this.isLoading = true;
            this.errorMessage = null;
            this.activeEvent = null;

            this.event.next(null);

            this.api.getCustomEvent(eventId)
                .catch(error => {
                    this.errorMessage = error._body
                    this.isLoading = false;
                    return Observable.throw(error);
                })
                .subscribe(data => this.setup(data));
        });
    }

    private setup(data: any) {
        this.setupHeader(data.name, data.description, data.mapId);

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
        super.ngOnDestroy();
    }
}