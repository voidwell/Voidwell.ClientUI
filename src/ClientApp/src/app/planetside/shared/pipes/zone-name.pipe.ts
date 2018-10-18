import { Pipe, PipeTransform } from '@angular/core';
import { ZoneService } from './../services/zone-service.service';

@Pipe({ name: 'zoneName', pure: false })

export class ZoneNamePipe implements PipeTransform {
    private zones;

    constructor(private zoneService: ZoneService) {
        this.zoneService.Zones.subscribe(zones => this.zones = zones);
    }

    transform(zoneId: any): string {
        if (!zoneId) {
            return null;
        }

        let id = zoneId.toString();

        if (!this.zones) {
            return null;
        }

        let zone = this.zones.filter(zone => zone.id.toString() === id);
        if (zone.length > 0) {
            return zone[0].name;
        }

        return null;
    }
}