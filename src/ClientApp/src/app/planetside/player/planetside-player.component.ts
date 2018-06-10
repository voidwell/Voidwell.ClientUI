import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PlanetsideApi } from './../planetside-api.service';
import { HeaderService, HeaderConfig, HeaderInfoItem } from './../../shared/services/header.service';

@Component({
    selector: 'planetside-player',
    templateUrl: './planetside-player.template.html',
    providers: [PlanetsideApi]
})

export class PlanetsidePlayerComponent implements OnDestroy {
    isLoading: boolean;
    errorMessage: string = null;
    playerData: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    private routeSub: Subscription;

    constructor(private api: PlanetsideApi, private route: ActivatedRoute, private router: Router, private headerService: HeaderService, private decimalPipe: DecimalPipe) {
        this.routeSub = this.route.params.subscribe(params => {
            let id = params['id'];
            this.isLoading = true;
            this.errorMessage = null;

            this.playerData.next(null);

            this.api.getCharacter(id)
                .pipe<any>(catchError(error => {
                    this.errorMessage = error._body || error.statusText
                    this.isLoading = false;
                    return Observable.throw(error);
                }))
                .subscribe(data => {
                    this.playerData.next(data);

                    let headerConfig = new HeaderConfig();
                    headerConfig.title = data.name;
                    headerConfig.subtitle = data.world;

                    if (data.factionId === 1) {
                        headerConfig.background = '#3f1f66';
                    } else if (data.factionId === 2) {
                        headerConfig.background = '#1f3866';
                    } else if (data.factionId === 3) {
                        headerConfig.background = '#661f20';
                    }

                    let timePlayedHeader = this.decimalPipe.transform(data.lifetimeStats.playTime / 3600, '.1-1') + ' (' + this.decimalPipe.transform(data.times.minutesPlayed / 60, '.1-1') + ')';

                    headerConfig.info = [
                        new HeaderInfoItem('Battle Rank', data.battleRank),
                        new HeaderInfoItem('Score', this.decimalPipe.transform(data.lifetimeStats.score)),
                        new HeaderInfoItem('Kills', this.decimalPipe.transform(data.lifetimeStats.kills)),
                        new HeaderInfoItem('Deaths', this.decimalPipe.transform(data.lifetimeStats.deaths)),
                        new HeaderInfoItem('Hours Played', timePlayedHeader)
                    ];

                    this.headerService.setHeaderConfig(headerConfig);

                    this.isLoading = false;
                });
        });
    }

    ngOnDestroy() {
        this.playerData.unsubscribe();
        this.routeSub.unsubscribe();
        this.headerService.reset();
    }
}