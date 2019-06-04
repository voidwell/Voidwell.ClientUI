import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { PlanetsideApi } from './../../shared/services/planetside-api.service';
import { WorldNamePipe } from './../../shared/pipes';

@Component({
    templateUrl: './planetside-world.template.html'
})

export class PlanetsideWorldComponent implements OnDestroy {
    private routeSub: Subscription;

    worldId: number = null;

    navLinks = [
        { path: 'activity', display: 'Activity' },
        { path: 'players', display: 'Online players' },
        { path: 'map', display: 'Map' }
    ];

    constructor(private route: ActivatedRoute, private api: PlanetsideApi, private worldName: WorldNamePipe) {
        this.routeSub = this.route.params.subscribe(params => {
            if (!params['worldId']) {
                return;
            }
            this.worldId = parseInt(params['worldId']);
        });
    }

    getOnlinePlayers(): Observable<any> {
        return this.api.getOnlinePlayers(this.worldId);
    }

    getActivity(): Observable<any> {
        return this.api.getWorldActivity(this.worldId, 1);
    }

    getWorldState(): Observable<any> {
        return this.api.getWorldState(this.worldId);
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}