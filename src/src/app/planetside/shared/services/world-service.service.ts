import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Injectable, OnDestroy } from '@angular/core';
import { PlanetsideApi } from './planetside-api.service';
import reducers from './../../planetside.reducers';
import { WithSubStore, select } from '@angular-redux/store';

@WithSubStore({
    basePathMethodName: 'getBasePath',
    localReducer: reducers
})

@Injectable()
export class WorldService implements OnDestroy {
    @select('platform') readonly platform$: Observable<any>;
    private platformSub: Subscription;
    private worldSub: Subscription;

    public Worlds: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private ps2Api: PlanetsideApi) {
        this.platformSub = this.platform$.subscribe(platformState => {
            this.worldSub = this.ps2Api.getAllWorlds().subscribe(worlds => {
                if (worlds != null) {
                    this.Worlds.next(worlds);
                }
            });
        });
    }

    ngOnDestroy(): void {
        if (this.platformSub) this.platformSub.unsubscribe();
        if (this.worldSub) this.worldSub.unsubscribe();
    }

    private getBasePath() {
        return ['ps2'];
    }
}