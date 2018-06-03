import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'zoneName'})

export class ZoneNamePipe implements PipeTransform {
    zones = {
        2: 'Indar',
        4: 'Hossin',
        6: 'Amerish',
        8: 'Esamir',
        96: 'VR training zone (NC)',
        97: 'VR training zone (TR)',
        98: 'VR training zone (VS)'
    };

    transform(zoneId: any): string {
        if (!zoneId) {
            return null;
        }
        let id = zoneId.toString();
        return this.zones[id];
    }
}