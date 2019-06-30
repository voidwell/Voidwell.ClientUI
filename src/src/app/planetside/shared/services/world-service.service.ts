import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { PlanetsideApi } from './planetside-api.service';

@Injectable()
export class WorldService {
    public Worlds: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private ps2Api: PlanetsideApi) {
        ps2Api.getAllWorlds().subscribe(worlds => {
            if (worlds != null) {
                this.Worlds.next(worlds);
            }
        });
    }
}