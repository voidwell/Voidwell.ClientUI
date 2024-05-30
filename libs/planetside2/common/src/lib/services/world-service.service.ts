import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { World } from '../contracts/world.model';
import { MapRepository } from '../repositories/map.repository';

@Injectable()
export class WorldService {
    public readonly Worlds = new BehaviorSubject<World[]>([]);

    constructor(private repository: MapRepository) {
        this.repository.getWorlds('pc').subscribe(worlds => {
            if (worlds != null) {
                this.Worlds.next(worlds);
            }
        });
    }
}