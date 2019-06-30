import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { divIcon, DivIcon, DivIconOptions } from 'leaflet';
import { FacilityTypes, Factions } from './../configs';
import { PlanetsideApi } from './planetside-api.service';

@Injectable()
export class ZoneHelper {
    zoneMaps: { [zoneId: number]: ZoneMap } = {};
    facilityIcons: { [facilityTypeId: number]: { [factionId: number]: DivIcon } } = {};

    constructor(private api: PlanetsideApi) {
        for (let facilityTypeId in FacilityTypes) {
            let facilityType = FacilityTypes[facilityTypeId];

            let options: DivIconOptions;
            switch (facilityType.code) {
                case 'amp_station':
                case 'bio_lab':
                case 'interlink_facility':
                case 'tech_plant':
                case 'warpgate':
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

            this.facilityIcons[facilityTypeId] = {};
            for (let factionId in Factions) {
                let html = "<svg class='" + facilityType.code + " " + Factions[factionId].code + "'>";
                html += "<use xlink:href='/files/img/ps2/map-sprites.svg#" + facilityType.code + "'/>";
                html += "</svg>";
                options.html = html;
                this.facilityIcons[facilityTypeId][factionId] = divIcon(options);
            }
        }
    }

    getZoneOwnership(worldId:number, zoneId: number): Observable<any> {
        return this.api.getZoneOwnership(worldId, zoneId);
    }

    getZoneMap(zoneId: number): Observable<ZoneMap> {
        return new Observable<ZoneMap>(observer => {
            if (this.zoneMaps[zoneId]) {
                setTimeout(() => {
                    observer.next(this.zoneMaps[zoneId]);
                    observer.complete();
                }, 10);
            } else {
                this.api.getZoneMap(zoneId)
                    .subscribe(data => {
                        var map = new ZoneMap();
                        map.hexs = data.hexs;
                        map.regions = data.regions;
                        map.links = data.links;

                        this.zoneMaps[zoneId] = map;

                        observer.next(this.zoneMaps[zoneId]);
                        observer.complete();
                    });
            }
        });
    }

    getFacilityName(zoneId: number, facilityId: number): string {
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

export class ZoneMap {
    links: any[] = [];
    regions: any[] = [];
    hexs: any[] = [];
}