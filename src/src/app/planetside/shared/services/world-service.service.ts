import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Injectable, OnDestroy } from '@angular/core';
import { PlanetsideApi } from './planetside-api.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/app.states';
import { selectPlanetsideState } from '../../store/planetside.states';

@Injectable()
export class WorldService implements OnDestroy {    
    private platformSub: Subscription;
    private worldSub: Subscription;

    public Worlds: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private ps2Api: PlanetsideApi, private store : Store<AppState>) {
        this.platformSub = this.store.select(selectPlanetsideState)
            .subscribe(() => {
                this.worldSub = this.ps2Api.getAllWorlds()
                    .subscribe(worlds => {
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
}