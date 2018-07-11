import { latLng, polyline, Map, LatLng, Polygon, Polyline, Marker, PolylineOptions, MarkerOptions, PathOptions } from 'leaflet';
import { Factions } from './../configs';

export class ZoneMap {
    links: any[] = [];
    regions: any[] = [];
    hexs: any[] = [];
}

export class VertexPoint {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.y = Math.round(x * 1000) / 1000;
        this.x = Math.round(y * 1000) / 1000;
    }

    equals(other: VertexPoint): boolean {
        return this.x === other.x && this.y == other.y;
    }

    toLatLng(): LatLng {
        return latLng(this.x, this.y);
    }
}

export class VertexLine {
    v1: VertexPoint;
    v2: VertexPoint;

    constructor(v1: VertexPoint, v2: VertexPoint) {
        this.v1 = v1;
        this.v2 = v2;
    }

    equals(other: VertexLine): boolean {
        return (this.v1.equals(other.v1) && this.v2.equals(other.v2)) || (this.v1.equals(other.v2) && this.v2.equals(other.v1))
    }
}

export class ZoneRegion extends Polygon {
    id: string;
    faction: number = 0;
    facility: ZoneFacility = null;

    constructor(regionId:string, latLngs: LatLng[], options?: PolylineOptions) {
        super(latLngs, options);

        this.id = regionId;

        this.setStyle({ 'className': 'region region-' + this.id });
    }

    setFaction(faction: number) {
        this.faction = faction;

        let elem = document.getElementsByClassName('region-' + this.id);
        if (elem.length === 0) {
            return;
        }

        elem[0].classList.remove('vs', 'nc', 'tr');

        let factionCode = Factions[this.faction].code
        elem[0].classList.add(factionCode);
        elem[0].classList.add('capture-flash');

        setTimeout(function () {
            elem[0].classList.remove('capture-flash');
        }, 1000);
    }

    setLinkedState(isLinked: boolean) {
        let elem = document.getElementsByClassName('region-' + this.id);
        if (elem.length === 0) {
            return;
        }

        if (isLinked) {
            elem[0].classList.remove('unconnected');
        } else {
            elem[0].classList.add('unconnected');
        }
    }

    private hexToRgb(hex) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
}

export class ZoneFacility extends Marker {
    id: string;
    name: string;
    facilityType: string;
    facilityTypeId: number;
    faction: number = 0;
    region: ZoneRegion;
    links: ZoneFacility[] = [];
    lattice: LatticeLink[] = [];

    facilityIcons: any;
    warpgates: any;

    constructor(latLng: LatLng, facilityIcons: any, warpgates: any, options?: MarkerOptions) {
        super(latLng, options);

        this.facilityIcons = facilityIcons;
        this.warpgates = warpgates;
    }

    isLinked(): boolean {
        let linked = [];
        let faction = this.faction;
        let id = this.id;

        let checkLinkedFacilities = function (facility: ZoneFacility): boolean {
            linked.push(facility.id);
            for (let i = 0; i < facility.links.length; i++) {
                var f = facility.links[i];
                if (f.id === id) {
                    return true;
                }

                if (f.faction === faction && (linked.indexOf(f.id) < 0)) {
                    if (checkLinkedFacilities(f)) {
                        return true;
                    }
                }
            }

            return false;
        };

        if (!this.warpgates[faction]) {
            return false;
        }

        let isLinked = checkLinkedFacilities(this.warpgates[faction]);

        this.region.setLinkedState(isLinked);

        return isLinked;
    }

    setFaction(faction: number) {
        this.faction = faction

        if (!this.setIcon) {
            return false;
        }

        this.setIcon(this.facilityIcons[this.facilityTypeId][this.faction]);
    }
}

export class LatticeLink {
    faction: number;
    facilities: ZoneFacility[] = [];

    outline: Polyline;
    line: Polyline;

    constructor(facilityA: ZoneFacility, facilityB: ZoneFacility) {
        this.facilities = [facilityA, facilityB];

        let points = [facilityA.getLatLng(), facilityB.getLatLng()];
        if (points[0] && points[1]) {
            this.outline = polyline(points, {
                className: 'lattice-outline lattice-outline_' + facilityA.id + '-' + facilityB.id,
                pane: 'latticePane',
                interactive: false
            });
            this.line = polyline(points, {
                className: 'lattice-line lattice-line_' + facilityA.id + '-' + facilityB.id,
                pane: 'latticePane',
                dashArray: null,
                interactive: false
            });
        }
    }

    setFaction() {
        let outlineElem = document.getElementsByClassName('lattice-outline_' + this.facilities[0].id + '-' + this.facilities[1].id);
        let lineElem = document.getElementsByClassName('lattice-line_' + this.facilities[0].id + '-' + this.facilities[1].id);
        if (outlineElem.length === 0 || lineElem.length === 0) {
            return;
        }

        lineElem[0].classList.remove('vs', 'nc', 'tr', 'contested');
        outlineElem[0].classList.remove('contested');        

        let faction;

        if (this.facilities[0].faction === this.facilities[1].faction) {
            this.faction = this.facilities[0].faction;
            let factionCode = Factions[this.faction].code;
            lineElem[0].classList.add(factionCode);
        } else {
            this.faction = null;

            faction = 'contested';
            outlineElem[0].classList.add('contested');
            lineElem[0].classList.add('contested');
        }
    }

    addTo(map: Map) {
        if (this.line && this.outline) {
            this.outline.addTo(map);
            this.line.addTo(map);
        }
    }
}