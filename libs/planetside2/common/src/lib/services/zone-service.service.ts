import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Zone } from '../contracts/zone.model';
import { MapRepository } from '../repositories/map.repository';

@Injectable()
export class ZoneService {
    public readonly Zones = new BehaviorSubject<Zone[]>([]);

    constructor(private repository: MapRepository) {
        this.repository.getZones('pc').subscribe(zones => {
            if (zones != null) {
                this.Zones.next(zones);
            }
        });
    }
}