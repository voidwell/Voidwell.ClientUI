import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { divIcon, DivIcon, DivIconOptions } from 'leaflet';
import { FacilityTypes, Factions } from './configs';
import { WorldStateRepository } from '@core/api/ps2/world-state.repository';
import { MapRepository } from '@core/api/ps2/map.repository';
import { ZoneMap, ZoneRegionOwnership } from '@core/api/models/ps2/map.model';

@Injectable()
export class ZoneHelper {
    private worldStateRepository = inject(WorldStateRepository);
    private mapRepository = inject(MapRepository);

    zoneMaps: { [zoneId: number]: ZoneMap } = {};
    facilityIcons: { [facilityTypeId: number]: { [factionId: number]: DivIcon } } = {};

    constructor() {
        for (const facilityTypeId in FacilityTypes) {
            const facilityType = FacilityTypes[Number(facilityTypeId)];

            let options: DivIconOptions;
            switch (facilityType.code) {
                case 'amp_station':
                case 'bio_lab':
                case 'interlink_facility':
                case 'tech_plant':
                case 'warpgate':
                case 'seapost':
                    options = {
                        className: 'svg-icon svg-icon-large',
                        iconSize: [24, 24],
                        iconAnchor: [12, 12],
                        tooltipAnchor: [0, 0],
                        html: ''
                    };
                    break;
                case 'large_outpost':
                    options = {
                        className: 'svg-icon svg-icon-medium',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10],
                        tooltipAnchor: [0, 0],
                        html: ''
                    };
                    break;
                default:
                    options = {
                        className: 'svg-icon svg-icon-small',
                        iconSize: [16, 16],
                        iconAnchor: [8, 8],
                        tooltipAnchor: [0, 0],
                        html: ''
                    };
            }

            this.facilityIcons[Number(facilityTypeId)] = {};
            for (const factionId in Factions) {
                let html = "<svg class='" + facilityType.code + " " + Factions[Number(factionId)].code + "'>";
                html += "<use xlink:href='/files/img/ps2/map-sprites.svg#" + facilityType.code + "'/>";
                html += "</svg>";
                options.html = html;
                this.facilityIcons[Number(facilityTypeId)][factionId] = divIcon(options);
            }
        }
    }

    getZoneOwnership(worldId: number, zoneId: number): Observable<ZoneRegionOwnership[]> {
        return this.worldStateRepository.getZoneOwnership(worldId, zoneId);
    }

    getZoneMap(zoneId: number): Observable<ZoneMap> {
        return new Observable<ZoneMap>(observer => {
            if (this.zoneMaps[zoneId]) {
                setTimeout(() => {
                    observer.next(this.zoneMaps[zoneId]);
                    observer.complete();
                }, 10);
            } else {
                this.mapRepository.getZoneMap(zoneId)
                    .subscribe(data => {
                        this.zoneMaps[zoneId] = data;

                        observer.next(this.zoneMaps[zoneId]);
                        observer.complete();
                    });
            }
        });
    }

    getFacilityName(zoneId: number, facilityId: number | string): string {
        if (!this.zoneMaps[zoneId]) {
            return facilityId.toString();
        }

        for (let i = 0; i < this.zoneMaps[zoneId].regions.length; i++) {
            if (this.zoneMaps[zoneId].regions[i].facilityId == facilityId) {
                return this.zoneMaps[zoneId].regions[i].facilityName;
            }
        }

        return facilityId.toString();
    }
}

export type { ZoneMap };
