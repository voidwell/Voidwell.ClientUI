import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { PlanetsideApi } from './../../planetside-api.service';
import { HeaderService, HeaderConfig } from './../../../shared/services/header.service';
import { WorldNamePipe } from './../../../shared/pipes/ps2/world-name.pipe';

@Component({
    templateUrl: './planetside-world.template.html'
})

export class PlanetsideWorldComponent implements OnDestroy {
    private routeSub: Subscription;
    private worldId: string = null;

    navLinks = [
        { path: 'players', display: 'Online players' },
    ];

    constructor(private route: ActivatedRoute, private api: PlanetsideApi, private headerService: HeaderService, private worldName: WorldNamePipe) {
        this.routeSub = this.route.params.subscribe(params => {
            this.worldId = params['worldId'];

            var headerConfig = new HeaderConfig();
            headerConfig.title = this.worldName.transform(this.worldId);

            this.headerService.setHeaderConfig(headerConfig);
        });
    }

    getOnlinePlayers(): Observable<any> {
        return this.api.getOnlinePlayers(this.worldId);
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
        this.headerService.reset();
    }
}