import { BehaviorSubject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { PlanetsideApi } from './planetside-api.service';

@Injectable()
export class ZoneService {
    public Zones: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private ps2Api: PlanetsideApi) {
        ps2Api.getAllZones().subscribe(data => {
            if (data != null) {
                this.Zones.next(data);
            }
        });
    }

    getZoneName(zoneId: any): Observable<string> {
        let id = zoneId.toString();

        return this.ps2Api.getAllZones().pipe(first(data => {
            let zone = data.filter(z => z.id.toString() === id);
            if (zone.length > 0) {
                return zone[0].name;
            }
        }));
    }
}