import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HeaderService } from '../../../shared/services/header.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { PlanetsideApi } from './../../planetside-api.service';
import { PlanetsideCombatEventComponent } from './../../combat-event/planetside-combat-event.component';

@Component({
    templateUrl: './planetside-alert.template.html',
    styleUrls: ['./planetside-alert.styles.css'],
    providers: [PlanetsideCombatEventComponent]
})

export class PlanetsideAlertComponent extends PlanetsideCombatEventComponent implements OnDestroy {
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

    constructor(private api: PlanetsideApi, private route: ActivatedRoute, private headerService: HeaderService) {
        super();

        this.sub = this.route.params.subscribe(params => {
            let worldId = params['worldId'];
            let instanceId = params['instanceId'];

            this.isLoading = true;
            this.errorMessage = null;
            this.activeEvent = null;

            this.event.next(null);

            this.api.getAlert(worldId, instanceId)
                .catch(error => {
                    this.errorMessage = error._body
                    this.isLoading = false;
                    return Observable.throw(error);
                })
                .subscribe(data => this.setup(data));
        });
    }

    private setup(data: any) {
        this.headerService.activeHeader.title = data.metagameEvent.name;
        this.headerService.activeHeader.subtitle = data.metagameEvent.description;

        if (data.zoneId === '2') {
            // Indar
            this.headerService.activeHeader.background = '#421c0a';
        } else if (data.zoneId === '4') {
            // Hossin
            this.headerService.activeHeader.background = '#2a3f0d';
        } else if (data.zoneId === '6') {
            // Amerish
            this.headerService.activeHeader.background = '#0a421c';
        } else if (data.zoneId === '8') {
            // Esamir
            this.headerService.activeHeader.background = '#10393c';
        } else {
            this.headerService.activeHeader.background = '#1e282e';
        }

        this.event.next(data);
        console.log('alert');
        console.log(data);
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