import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlanetsideApi } from './../planetside-api.service';
import { Subscription } from 'rxjs/Subscription';
import { HeaderService } from './../../shared/services/header.service';

@Component({
    selector: 'planetside-player',
    templateUrl: './planetside-player.template.html',
    styleUrls: ['../../app.styles.css'],
    providers: [PlanetsideApi]
})

export class PlanetsidePlayerComponent implements OnDestroy {
    errorMessage: string = null;
    isLoading: boolean;

    playerData: any;
    routeSub: Subscription;

    constructor(private api: PlanetsideApi, private route: ActivatedRoute, private headerService: HeaderService) {
        this.routeSub = this.route.params.subscribe(params => {
            let id = params['id'];
            this.isLoading = true;

            this.api.getCharacter(id)
                .subscribe(data => {
                    this.playerData = data;

                    this.headerService.activeHeader.title = data.name;
                    this.headerService.activeHeader.subtitle = data.world;

                    if (data.factionId === '1') {
                        this.headerService.activeHeader.background = '#321147';
                    } else if (data.factionId === '2') {
                        this.headerService.activeHeader.background = '#112447';
                    } else if (data.factionId === '3') {
                        this.headerService.activeHeader.background = '#471111';
                    }

                    this.isLoading = false;
                });
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
        this.headerService.reset();
    }
}