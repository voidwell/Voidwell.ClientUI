import { divIcon, DivIcon, Map, DivIconOptions } from 'leaflet';
import { ZoneRegion, ZoneFacility, LatticeLink } from './zone/models';
import { FacilityTypes, Factions } from './../../../shared/configs';

export class WorldMaps {
    facilityIcons: { [facilityTypeId: number]: { [factionId: number]: DivIcon } } = {};
    zoneMaps: { [zoneId: number]: ZoneMap } = {};
    zoneLogs: { [zoneId: number]: any[] } = {};

    constructor() {
        this.setupFacilityIcons();
    }

    private setupFacilityIcons() {
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
}

export class ZoneMap {
    links: any[] = [];
    regions: any[] = [];
    hexs: any[] = [];
}