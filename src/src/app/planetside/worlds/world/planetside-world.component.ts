import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription, BehaviorSubject, timer } from 'rxjs';
import { PlanetsideApi } from './../../shared/services/planetside-api.service';
import { WorldNamePipe } from './../../shared/pipes';
import { mergeMapTo } from 'rxjs/operators';

@Component({
    templateUrl: './planetside-world.template.html',
    styleUrls: ['./planetside-world.styles.css']
})

export class PlanetsideWorldComponent implements OnDestroy {
    private routeSub: Subscription;
    private worldSub: Subscription;
    private activitySub: Subscription;
    private alertsSub: Subscription;

    isLoading: boolean = false;
    worldId: number = null;
    world: any;
    zoneTotal: any = {};

    activitySubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    alertsSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    navLinks = [
        { path: 'activity', display: 'Activity', icon: 'mdi-radar' },
        { path: 'players', display: 'Online players', icon: 'mdi-account-multiple' },
        { path: 'map', display: 'Map', icon: 'mdi-map' }
    ];

    constructor(private route: ActivatedRoute, private api: PlanetsideApi, private worldName: WorldNamePipe) {
        let self = this;

        this.routeSub = this.route.params.subscribe(params => {
            if (!params['worldId']) {
                return;
            }

            this.isLoading = true;
            if (this.worldSub) this.worldSub.unsubscribe();
            if (this.activitySub) this.activitySub.unsubscribe();
            if (this.alertsSub) this.alertsSub.unsubscribe();

            this.activitySubject.next(null);
            this.alertsSubject.next(null);

            this.worldId = parseInt(params['worldId']);

            this.worldSub = timer(0, 60000)
                .pipe(mergeMapTo(this.api.getWorldState(this.worldId)))
                .subscribe(function(worldState) {
                    self.world = worldState;

                    Object.keys(self.zoneTotal).forEach(function(f) {
                        self.zoneTotal[f] = 0;
                    });

                    worldState.zoneStates.forEach(function(zoneState) {
                        Object.keys(zoneState.population).forEach(function(f) {
                            if (!self.zoneTotal[f]) self.zoneTotal[f] = 0;
                            self.zoneTotal[f] += zoneState.population[f]
                        });
                    });

                    self.isLoading = false;
                });
            
            this.activitySub = timer(0, 60000)
                .pipe(mergeMapTo(this.api.getWorldActivity(this.worldId, 1)))
                .subscribe(function(activity) {
                    self.activitySubject.next(activity);
                });

            this.alertsSub = timer(0, 60000)
                .pipe(mergeMapTo(this.api.getAlertsByWorldId(0, this.worldId)))
                .subscribe(function(alerts) {
                    let now = new Date();

                    let activeAlerts = alerts.map(a => {
                        a.startDate = new Date(a.startDate);
                        a.endDate = a.endDate ? new Date(a.endDate) : null;
                        return a;
                    }).filter(alert => alert.endDate !== null && alert.endDate > now);

                    self.alertsSubject.next(activeAlerts);
                });
        });
    }

    getOnlinePlayers(): Observable<any> {
        return this.api.getOnlinePlayers(this.worldId);
    }

    getActivity(): Observable<any> {
        return this.activitySubject.asObservable();
    }

    getAlerts(): Observable<any> {
        return this.alertsSubject.asObservable();
    }

    getMinutes(value) : number {
        let now = new Date();
        let valueDate = new Date(value);
        let diffMs = (now.getTime() - valueDate.getTime());
        return Math.round((diffMs / 1000) / 60);
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
        if (this.worldSub) this.worldSub.unsubscribe();
        if (this.activitySub) this.activitySub.unsubscribe();
        if (this.alertsSub) this.alertsSub.unsubscribe();
    }
}