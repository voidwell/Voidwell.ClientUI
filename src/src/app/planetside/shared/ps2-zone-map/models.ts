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
    flashTimeout = null;

    constructor(regionId:string, latLngs: LatLng[], options?: PolylineOptions) {
        super(latLngs, options);

        this.id = regionId;

        this.setStyle({ 'className': 'region' });
    }

    setFaction(faction: number, noFlash: boolean = false) {
        if (this.faction === faction) {
            return;
        }

        this.faction = faction;

        let elem = this.getElement();
        if (!elem) return;

        if (this.flashTimeout) {
            clearTimeout(this.flashTimeout);
            elem.classList.remove('capture-flash');
        }

        elem.classList.remove('vs', 'nc', 'tr');

        let factionCode = Factions[this.faction].code
        elem.classList.add(factionCode);

        if (!noFlash) {
            elem.classList.add('capture-flash');
            this.flashTimeout = setTimeout(function () {
                if (elem) elem.classList.remove('capture-flash');
            }, 1000);
        }
    }

    setLinkedState(isLinked: boolean) {
        if (this.facility.facilityTypeId === 7) return;

        let elem = this.getElement();
        if (!elem) return;

        if (isLinked) {
            elem.classList.remove('unconnected');
        } else {
            elem.classList.add('unconnected');
        }
    }

    enablePopup() {
        let self = this;
        this.bindPopup(function() {
            return "<div>RegionId: " + self.id+ "</div>" +
                   "<div>FacilityId: " + self.facility.id+ "</div>" +
                   "<div>FacilityName: " + self.facility.name+ "</div>" +
                   "<div>FacilityType: " + self.facility.facilityType+ "</div>" +
                   "<div>FactionId: " + self.faction+ "</div>";
        }, );
    }

    disablePopup() {
        this.unbindPopup();
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
    warpgates: ZoneFacility[] = [];

    constructor(latLng: LatLng, facilityIcons: any, warpgates: ZoneFacility[], options?: MarkerOptions) {
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

        let factionWarpgate =this.warpgates.find(f => f.faction === faction);
        if (!factionWarpgate) {
            return false;
        }

        let isLinked = checkLinkedFacilities(factionWarpgate);

        this.region.setLinkedState(isLinked);

        return isLinked;
    }

    setFaction(faction: number) {
        if (this.faction === faction) {
            return;
        }
        
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
                className: 'lattice-outline',
                pane: 'latticePane',
                interactive: false
            });
            this.line = polyline(points, {
                className: 'lattice-line',
                pane: 'latticePane',
                dashArray: null,
                interactive: false
            });
        }
    }

    setFaction() {
        if (this.facilities[0].faction === this.facilities[1].faction) {
            this.faction = this.facilities[0].faction;
        } else {
            this.faction = null;
        }

        if (!this.outline || !this.line) return;

        let outlineElem = this.outline.getElement();
        let lineElem = this.line.getElement();
        if (!outlineElem || !lineElem) {
            return;
        }

        lineElem.classList.remove('vs', 'nc', 'tr', 'contested');
        outlineElem.classList.remove('contested');

        if (this.faction !== null) {
            let factionCode = Factions[this.faction].code;
            lineElem.classList.add(factionCode);
        } else {
            lineElem.classList.add('contested');
            outlineElem.classList.add('contested');
        }
    }

    addTo(map: Map) {
        if (this.line && this.outline) {
            this.outline.addTo(map);
            this.line.addTo(map);
        }
    }
}