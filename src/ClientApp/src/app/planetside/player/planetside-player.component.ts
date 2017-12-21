import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';
import { PlanetsideApi } from './../planetside-api.service';
import { HeaderService } from './../../shared/services/header.service';
import { Observable } from 'rxjs/Observable';
import { Observer } from "rxjs/Observer";
import 'rxjs/add/observable/throw';
import { Subscriber } from "rxjs/Subscriber";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

@Component({
    selector: 'planetside-player',
    templateUrl: './planetside-player.template.html',
    providers: [PlanetsideApi]
})

export class PlanetsidePlayerComponent implements OnDestroy {
    private isLoading: boolean;
    private errorMessage: string = null;
    private routeSub: Subscription;
    private navLinks = [
        { path: 'stats', label: 'Stats' },
        { path: 'classes', label: 'Classes' },
        { path: 'vehicles', label: 'Vehicles' },
        { path: 'weapons', label: 'Weapons' },
        { path: 'sessions', label: 'Sessions' },
    ];

    playerData: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private api: PlanetsideApi, private route: ActivatedRoute, private router: Router, private headerService: HeaderService, private decimalPipe: DecimalPipe) {
        this.routeSub = this.route.params.subscribe(params => {
            let id = params['id'];
            this.isLoading = true;
            this.errorMessage = null;

            this.playerData.next(null);

            this.api.getCharacter(id)
                .catch(error => {
                    this.errorMessage = error._body
                    this.isLoading = false;
                    return Observable.throw(error);
                })
                .subscribe(data => {
                    this.playerData.next(data);

                    this.headerService.activeHeader.title = data.name;
                    this.headerService.activeHeader.subtitle = data.world;

                    if (data.factionId === '1') {
                        this.headerService.activeHeader.background = '#321147';
                    } else if (data.factionId === '2') {
                        this.headerService.activeHeader.background = '#112447';
                    } else if (data.factionId === '3') {
                        this.headerService.activeHeader.background = '#471111';
                    }

                    this.headerService.activeHeader.info = [
                        { label: 'Battle Rank', value: data.battleRank },
                        { label: 'Score', value: this.decimalPipe.transform(data.lifetimeStats.score) },
                        { label: 'Kills', value: this.decimalPipe.transform(data.lifetimeStats.kills) },
                        { label: 'Deaths', value: this.decimalPipe.transform(data.lifetimeStats.deaths) },
                        { label: 'Hours Played', value: this.decimalPipe.transform(data.lifetimeStats.playTime / 3600, '.1-1') },
                    ];

                    this.isLoading = false;
                });
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
        this.headerService.reset();
    }
}