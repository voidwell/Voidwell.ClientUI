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
        { path: 'players', label: 'Players' },
        { path: 'outfits', label: 'Outfits' },
        { path: 'weapons', label: 'Weapons' },
        { path: 'vehicles', label: 'Vehicles' },
        { path: 'map', label: 'Map' }
    ];

    constructor(private api: VoidwellApi, private route: ActivatedRoute, private headerService: HeaderService) {
        super();

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
        this.headerService.activeHeader.title = data.name;
        this.headerService.activeHeader.subtitle = data.description;

        if (data.mapId === '2') {
            // Indar
            this.headerService.activeHeader.background = '#421c0a';
        } else if (data.mapId === '4') {
            // Hossin
            this.headerService.activeHeader.background = '#2a3f0d';
        } else if (data.mapId === '6') {
            // Amerish
            this.headerService.activeHeader.background = '#0a421c';
        } else if (data.mapId === '8') {
            // Esamir
            this.headerService.activeHeader.background = '#10393c';
        } else {
            this.headerService.activeHeader.background = '#1e282e';
        }

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
        this.headerService.reset();
    }
}