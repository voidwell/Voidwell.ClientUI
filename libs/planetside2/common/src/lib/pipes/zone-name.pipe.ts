import { Pipe, PipeTransform } from '@angular/core';
import { Zone } from '../contracts/zone.model';
import { ZoneService } from '../services/zone-service.service';

@Pipe({ name: 'zoneName', pure: false })

export class ZoneNamePipe implements PipeTransform {
    private zones: Zone[] = [];

    constructor(private zoneService: ZoneService) {
        this.zoneService.Zones.subscribe(zones => this.zones = zones);
    }

    transform(zoneId: string | number): string | undefined {
        if (!zoneId || !this.zones) {
            return undefined;
        }

        return this.zones.find(zone => zone.id.toString() === zoneId.toString())?.name;
    }
}