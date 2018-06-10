import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, BehaviorSubject } from "rxjs";
import { PlanetsideApi } from './../planetside-api.service';
import { HeaderService, HeaderConfig } from './../../shared/services/header.service';

@Component({
    templateUrl: './planetside-item.template.html',
    styleUrls: ['./planetside-item.styles.css']
})

export class PlanetsideItemComponent implements OnDestroy {
    errorMessage: string = null;
    isLoading: boolean;

    routeSub: Subscription;
    weaponData: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    navLinks = [
        { path: 'stats', display: 'Stats' },
        { path: 'leaderboard', display: 'Leaderboard' }
    ];

    constructor(private api: PlanetsideApi, private route: ActivatedRoute, private headerService: HeaderService) {
        this.routeSub = this.route.params.subscribe(params => {
            let id = params['id'];
            this.isLoading = true;

            this.api.getWeaponInfo(id)
                .subscribe(data => {
                    this.weaponData.next(data);

                    let headerConfig = new HeaderConfig();
                    headerConfig.title = data.name;
                    headerConfig.subtitle = data.category;

                    if (data.factionId === 1) {
                        headerConfig.background = '#321147';
                    } else if (data.factionId === 2) {
                        headerConfig.background = '#112447';
                    } else if (data.factionId === 3) {
                        headerConfig.background = '#471111';
                    }

                    this.headerService.setHeaderConfig(headerConfig);

                    this.isLoading = false;
                });
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
        this.headerService.reset();
        this.weaponData.unsubscribe();
    }
}