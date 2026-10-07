import { Pipe, PipeTransform, inject } from '@angular/core';
import { ZoneService } from '../data/zone.service';

@Pipe({
    name: 'zoneName', pure: false
})

export class ZoneNamePipe implements PipeTransform {
    private zoneService = inject(ZoneService);

    transform(zoneId: number | string): string | null {
        if (!zoneId) {
            return null;
        }

        return this.zoneService.zoneName(zoneId) ?? null;
    }
}
