import { latLng, polyline, Map, LatLng, Polygon, Polyline, Marker, PolylineOptions, MarkerOptions, PathOptions } from 'leaflet';
import { Factions } from './../../../../shared/configs';
import { RegionStyles, LatticeStyles, FactionColors } from './zone-configs';

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
    style: any;

    constructor(latLngs: LatLng[], options?: PolylineOptions) {
        super(latLngs, options);

        this.style = RegionStyles[0].default;
    }

    setFaction(faction: number) {
        this.faction = faction;

        if (this.faction > 0 && this.facility && this.facility.isLinked()) {
            this.style = RegionStyles[this.faction].default;
        } else if (this.faction > 0) {
            this.style = RegionStyles[this.faction].dark;
        }

        this.setStyle(this.style);
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

        return checkLinkedFacilities(this.warpgates[faction]);
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
            this.outline = polyline(points, LatticeStyles.ns.outline);
            this.line = polyline(points, LatticeStyles.ns.line);
        }
    }

    setFaction() {
        let faction;

        if (this.facilities[0].faction === this.facilities[1].faction) {
            this.faction = this.facilities[0].faction;
            faction = Factions[this.faction].code;
        } else {
            this.faction = null;
            faction = 'contested';
        }

        if (this.outline && this.line) {
            this.outline.setStyle(LatticeStyles[faction].outline);
            this.line.setStyle(LatticeStyles[faction].line);
        }
    }

    addTo(map: Map) {
        if (this.line && this.outline) {
            this.outline.addTo(map);
            this.line.addTo(map);
        }
    }
}