import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { PlanetsideWorldComponent } from './../../planetside-world.component';
import { WorldNamePipe } from './../../../../../shared/pipes/ps2/world-name.pipe';
import { ZoneNamePipe } from './../../../../../shared/pipes/ps2/zone-name.pipe';
import {
    Map, tileLayer, latLng, MapOptions, latLngBounds, LatLngBounds, CRS, Layer, polygon, Polygon, PolylineOptions, LatLng,
    icon, IconOptions, marker, MarkerOptions, TooltipOptions, Marker, DivIcon, DivIconOptions, divIcon, Polyline, polyline
} from 'leaflet';

@Component({
    templateUrl: './planetside-world-zone.template.html',
    styleUrls: ['./planetside-world-zone.styles.css']
})

export class PlanetsideWorldZoneComponent implements OnDestroy {
    private routeSub: Subscription;

    isLoading: boolean = true;
    errorMessage: string;
    zone: any;

    leafletOptions: MapOptions;
    fitBounds: LatLngBounds;

    socket: any;
    zoneMap = ZoneMap;

    constructor(private worldNamePipe: WorldNamePipe, private zoneNamePipe: ZoneNamePipe, private route: ActivatedRoute, private parent: PlanetsideWorldComponent) {
        this.routeSub = this.route.params.subscribe(params => {
            ZoneMap.reset();

            this.isLoading = true;

            ZoneMap.zoneId = params['zoneId'];
            ZoneMap.worldId = this.parent.worldId;

            let zoneName = zoneNamePipe.transform(ZoneMap.zoneId);

            this.leafletOptions = {
                crs: CRS.Simple,
                layers: [
                    tileLayer('/img/ps2/tiles/' + zoneName.toLowerCase() + '/zoom{z}/' + zoneName.toLowerCase() + '_{z}_{x}_{y}.jpg', {
                        minZoom: 1,
                        maxZoom: 6,
                        maxNativeZoom: 5,
                        noWrap: true,
                        continuousWorld: true,
                        bounds: latLngBounds(latLng(-128, -128), latLng(128, 128))
                    })
                ],
                attributionControl: false
            };

            this.parent.getZoneState(ZoneMap.zoneId)
                .catch(error => {
                    this.errorMessage = error._body
                    this.isLoading = false;
                    return Observable.throw(error);
                })
                .finally(() => {
                    this.isLoading = false;
                })
                .subscribe(zone => {
                    this.zone = zone;
                });
        });
    }

    onMapReady(map: Map) {
        ZoneMap.map = map;

        map.createPane('regions');
        map.createPane('latticePane');
        map.createPane('markerPane');
        map.createPane('markerLabelsPane');
        map.createPane('facilitiesPane');
        map.createPane('facilitiesLabelsPane');
        map.createPane('outpostsPane');
        map.createPane('outpostsLabelsPane');

        let mapZoom = function (e) {
            var elem = document.querySelector('.leaflet-map-pane');
            elem.setAttribute('data-zoom', e.target._zoom);
        };

        map.on('zoomend', mapZoom.bind(this)).fireEvent('zoomend');

        this.setupMapMarkers();
        this.setupMapRegions();
        this.setupMapLinks();
        this.setupOwnership();
        this.updateScore();

        map.fitBounds(latLngBounds(latLng(-128, -128), latLng(128, 128)));

        this.connectWebsocket();
    }

    setupMapMarkers() {
        let facilityGroups = this.groupBy(this.zone.ownership, 'facilityType');

        for (let facilityType in facilityGroups) {
            let options: DivIconOptions;

            switch (facilityType) {
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

            ZoneMap.facilityIcons[facilityType] = {};
            for (let id in Factions) {
                let html = "<svg class='" + facilityType + " " + Factions[id].code + "'>";
                html += "<use xlink:href='/img/ps2/map-sprites.svg#" + facilityType + "'/>";
                html += "</svg>";
                options.html = html;
                ZoneMap.facilityIcons[facilityType][Factions[id].code] = divIcon(options);
            }
        }

        for (let facilityType in facilityGroups) {
            let facilities = this.groupBy(facilityGroups[facilityType], 'facilityId');

            let markerOptions: MarkerOptions = {
                icon: ZoneMap.facilityIcons[facilityType].ns,
                pane: 'markerPane'
            };

            let tooltipOptions: TooltipOptions = {
                offset: [0, 0],
                pane: 'markerLabelsPane',
                permanent: true,
                direction: 'bottom'
            };

            switch (facilityType) {
                case 'amp_station':
                case 'bio_lab':
                case 'interlink_facility':
                case 'tech_plant':
                case 'warpgate':
                    markerOptions.pane = 'facilitiesPane';
                    tooltipOptions.pane = 'facilitiesLabelsPane';
                    break;
                case 'large_outpost':
                case 'small_outpost':
                    markerOptions.pane = 'outpostsPane';
                    tooltipOptions.pane = 'outpostsLabelsPane';
            }

            for (let facilityId in facilities) {
                let facility = facilities[facilityId][0];

                let hasLinks = false;
                for (var i = 0; i < this.zone.links.length; i++) {
                    let link = this.zone.links[i];
                    if (link.facilityIdA == facilityId || link.facilityIdB == facilityId) {
                        hasLinks = true;
                        break;
                    }
                }

                if (!hasLinks) {
                    continue;
                }

                let facilityLatLng;
                if (facility.x && facility.z) {
                    let x = facility.x * 0.03126;
                    let z = facility.z * 0.03126;
                    facilityLatLng = latLng(x, z);
                }

                let facilityMarker = new ZoneFacility(facilityLatLng, markerOptions);
                if (facility.facilityName) {
                    facilityMarker.bindTooltip(facility.facilityName, tooltipOptions);
                    facilityMarker.name = facility.facilityName;
                }
                facilityMarker.id = facilityId;
                facilityMarker.facilityType = facility.facilityType;

                ZoneMap.facilities[facilityId] = facilityMarker;

                if (facility.x && facility.z) {
                    facilityMarker.addTo(ZoneMap.map);
                }
            }
        }
    }

    setupMapRegions() {
        let width = 50 / 8;

        let b = width / 2;
        let c = b / Math.sqrt(3) * 2;
        let a = c / 2;

        var regionHexs = this.groupBy(this.zone.hexs, 'mapRegionId');
        
        for (var regionId in regionHexs) {
            var hexs = regionHexs[regionId];

            let regionLines: VertexLine[] = [];

            for (var hexIdx in hexs) {
                var hex = hexs[hexIdx];

                var xCord = hex.x;
                var yCord = hex.y;

                var x = (2 * hex.x + hex.y) / 2 * width;

                var y;
                if (hex.y % 2 == 1) {
                    let t = Math.floor(hex.y / 2);
                    y = c * t + 2 * c * (t + 1) + c / 2;
                } else {
                    y = (3 * c * hex.y) / 2 + c;
                }

                var hexVerts = [
                    new VertexPoint(x - b, y - a),
                    new VertexPoint(x, y - c),
                    new VertexPoint(x + b, y - a),
                    new VertexPoint(x + b, y + a),
                    new VertexPoint(x, y + c),
                    new VertexPoint(x - b, y + a)
                ];

                var hexLines = [
                    new VertexLine(hexVerts[0], hexVerts[1]),
                    new VertexLine(hexVerts[1], hexVerts[2]),
                    new VertexLine(hexVerts[2], hexVerts[3]),
                    new VertexLine(hexVerts[3], hexVerts[4]),
                    new VertexLine(hexVerts[4], hexVerts[5]),
                    new VertexLine(hexVerts[5], hexVerts[0])
                ];

                regionLines = regionLines.concat(hexLines);
            }

            let regionOuterLines = this.getOuterLines(regionLines);
            let regionOuterVerts = this.getOuterVerts(regionOuterLines);

            let latLngVerts = regionOuterVerts.map(function (a) { return a.toLatLng() });

            let options: PolylineOptions = {
                weight: 1.2,
                color: '#000',
                opacity: 1,
                fillOpacity: 0,
                pane: 'regions'
            };

            let region = new ZoneRegion(latLngVerts, options)
                .on('mouseover', function (e) {
                    return e.target.bringToFront().setStyle({
                        weight: 3,
                        color: '#FFF',
                        fillColor: this.style.fillColor
                    });
                })
                .on('mouseout', function (e) {
                    return e.target.setStyle(e.target.style);
                });

            region.id = regionId;

            if (ZoneMap.facilities[regionId]) {
                region.name = ZoneMap.facilities[regionId].name;
            }

            region.addTo(ZoneMap.map);

            ZoneMap.regions[regionId] = region;
        }
    }

    setupMapLinks() {
        for (let linkIdx in this.zone.links) {
            let link = this.zone.links[linkIdx];
            let facilityA = ZoneMap.facilities[link.facilityIdA];
            let facilityB = ZoneMap.facilities[link.facilityIdB];
            
            ZoneMap.lattice.push(new LatticeLink(facilityA, facilityB));
        }

        for (let idx in this.zone.ownership) {
            let region = this.zone.ownership[idx];

            if (ZoneMap.facilities[region.facilityId] && ZoneMap.regions[region.regionId]) {
                ZoneMap.regions[region.regionId].facility = ZoneMap.facilities[region.facilityId];
                ZoneMap.facilities[region.facilityId].region = ZoneMap.regions[region.regionId];
            }
        }

        for (let idx in ZoneMap.lattice) {
            var link = ZoneMap.lattice[idx];

            for (let id in link.facilities) {
                let facility = link.facilities[id];
                ZoneMap.facilities[id].lattice.push(link);

                for (let linkedFacilityId in link.facilities) {
                    let facility = link.facilities[linkedFacilityId];
                    if (id !== linkedFacilityId) {
                        ZoneMap.facilities[id].facilities.push(ZoneMap.facilities[linkedFacilityId]);
                    }
                }
            }
        }
    }

    setupOwnership() {
        let regions = this.groupBy(this.zone.ownership, 'regionId');
        let sameFaction = true;
        let prevFaction = null;

        for (let regionId in regions) {
            let region = regions[regionId][0];
            let faction = Factions[region.factionId].code;

            if (prevFaction === null) {
                prevFaction = faction;
            }

            if (prevFaction !== faction) {
                sameFaction = false;
            }

            if (ZoneMap.regions[regionId] && ZoneMap.regions[regionId].facility) {
                ZoneMap.regions[regionId].facility.setFaction(faction);
            } else if (ZoneMap.regions[regionId]) {
                ZoneMap.regions[regionId].setFaction(faction);
            }
        }

        if (sameFaction === true) {
            var elem = document.getElementsByClassName('territory-control');
            if (elem && elem.length > 0) {
                for (var e in elem) {
                    elem[e].classList.remove('vs', 'nc', 'tr');
                    elem[e].classList.add(prevFaction);
                }
            }
        }

        let facilityGroup = this.groupBy(this.zone.ownership, 'facilityType')
        for (let facilityType in facilityGroup) {
            if (facilityType == 'warpgate') {
                for (let idx in facilityGroup[facilityType]) {
                    let facility = facilityGroup[facilityType][idx];
                    ZoneMap.warpgates[Factions[facility.factionId].code] = ZoneMap.facilities[facility.facilityId];
                }
            }
        }

        for (let i = 0; i < ZoneMap.lattice.length; i++) {
            let link = ZoneMap.lattice[i];
            link.setFaction();
        }

        for (let id in ZoneMap.facilities) {
            if (ZoneMap.facilities[id].region) {
                ZoneMap.facilities[id].region.setFaction(ZoneMap.facilities[id].faction);
            }
        }
    }

    connectWebsocket() {
        let self = this;

        if (this.socket) {
            return;
        }

        this.socket = new WebSocket('wss://push.planetside2.com/streaming?environment=ps2&service-id=s:LampjawScraper');

        this.socket.onerror = function (e) {
            console.error('Websocket Error:', e);
            return true;
        };

        this.socket.onopen = function () {
            let subscription = '{"service":"event","action":"subscribe","worlds":["' + ZoneMap.worldId + '"],"eventNames":["FacilityControl","ContinentLock","ContinentUnlock"]}';
            this.send(subscription);
            return true;
        };

        this.socket.onmessage = function (message) {
            let data = JSON.parse(message.data);
            switch (data.type) {
                case "serviceMessage":
                    if (!data.payload) {
                        return false;
                    }
                    switch (data.payload.event_name) {
                        case "FacilityControl":
                            if (data.payload.new_faction_id === data.payload.old_faction_id) {
                                self.facilityDefended({
                                    zoneId: data.payload.zone_id,
                                    facilityId: data.payload.facility_id,
                                    factionId: data.payload.new_faction_id,
                                    timestamp: data.payload.timestamp
                                });
                            } else {
                                self.facilityCaptured({
                                    zoneId: data.payload.zone_id,
                                    facilityId: data.payload.facility_id,
                                    factionId: data.payload.new_faction_id,
                                    timestamp: data.payload.timestamp
                                });
                            }
                            break;
                        case "ContinentLock":
                            self.continentLock({
                                zoneId: data.payload.zone_id,
                                factionId: data.payload.triggering_faction,
                                timestamp: data.payload.timestamp
                            });
                            break;
                        case "ContinentUnlock":
                            self.continentUnlock({
                                zoneId: data.payload.zone_id,
                                timestamp: data.payload.timestamp
                            });
                    }
            }
        };
    }

    facilityDefended(payload: any) {
        if (parseInt(payload.zoneId) !== parseInt(ZoneMap.zoneId)) {
            return false;
        }

        let faction = Factions[payload.factionId].code;
        let facilityId = payload.facilityId;

        if (!ZoneMap.facilities[facilityId]) {
            return false;
        }

        let logData = {
            event: 'defend',
            facility: ZoneMap.facilities[facilityId],
            faction: Factions[payload.factionId],
            timestamp: new Date(payload.timestamp * 1000)
        };

        ZoneMap.eventLog.unshift(logData);
    }

    facilityCaptured(payload: any) {
        if (parseInt(payload.zoneId) !== parseInt(ZoneMap.zoneId)) {
            return false;
        }

        let faction = Factions[payload.factionId].code;
        let facilityId = payload.facilityId;

        if (!ZoneMap.facilities[facilityId]) {
            return false;
        }

        let logData = {
            event: 'capture',
            facility: ZoneMap.facilities[facilityId],
            faction: Factions[payload.factionId],
            timestamp: new Date(payload.timestamp * 1000)
        };

        ZoneMap.eventLog.unshift(logData);

        ZoneMap.facilities[facilityId].setFaction(faction);

        for (let latticeId in ZoneMap.facilities[facilityId].lattice) {
            ZoneMap.facilities[facilityId].lattice[latticeId].setFaction();
        }

        ZoneMap.facilities[facilityId].region.setFaction(faction);

        this.updateScore();
    }

    continentLock(payload: any) {
        if (parseInt(payload.zoneId) !== parseInt(ZoneMap.zoneId)) {
            return false;
        }

        let logData = {
            event: 'continent_lock',
            faction: Factions[payload.factionId],
            zone: Zones[payload.zoneId],
            timestamp: new Date(payload.timestamp * 1000)
        };

        ZoneMap.eventLog.unshift(logData);
    }

    continentUnlock(payload: any) {
        if (parseInt(payload.zoneId) !== parseInt(ZoneMap.zoneId)) {
            return false;
        }

        let logData = {
            event: 'continent_unlock',
            zone: Zones[payload.zoneId],
            timestamp: new Date(payload.timestamp * 1000)
        };

        ZoneMap.eventLog.unshift(logData);
    }

    updateScore() {
        let territories = {
            contested: 0,
            vs: -1,
            tr: -1,
            nc: -1
        };

        for (let facilityId in ZoneMap.facilities) {
            let facility = ZoneMap.facilities[facilityId];
            if (facility.isLinked()) {
                territories[facility.faction] += 1;
            } else {
                territories.contested += 1;
            }
        }

        let total = territories.vs + territories.nc + territories.tr + territories.contested;

        for (let faction in territories) {
            let territory = territories[faction];
            territories[faction] = territory / total * 100;
            if (territories[faction] < 0) {
                territories[faction] = 0;
            } else if (territories[faction] > 100) {
                territories[faction] = 100;
            }
        }

        territories.contested = 100 - (territories.vs + territories.nc + territories.tr);

        ZoneMap.score = [territories.contested, territories.vs, territories.nc, territories.tr];
    }

    focusFacility(facility: ZoneFacility) {
        let map: Map = ZoneMap.map;
        map.setView(facility.getLatLng(), 5);
    }

    groupBy(xs, key) {
        return xs.reduce(function (rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    };

    getOuterLines(lines: VertexLine[]): VertexLine[] {
        var outerLines = [];

        for (var i = 0; i < lines.length; i++) {
            var count = 1;

            for (var k = 0; k < lines.length; k++) {
                if (i === k) {
                    continue;
                }

                if (lines[i].equals(lines[k])) {
                    count++;
                    break;
                }
            }

            if (count === 1) {
                outerLines.push(lines[i]);
            }
        }
        return outerLines;
    };

    getOuterVerts(lines: VertexLine[]): VertexPoint[] {
        let tmp: VertexLine[] = [].concat(lines);

        let verts = [tmp[0].v1, tmp[0].v2];
        tmp.splice(0, 1);

        let loopCount = 0;
        while (tmp.length > 0) {
            for (var i = 0; i < tmp.length; i++) {
                if (tmp[i].v1.equals(verts[verts.length - 1])) {
                    verts.push(tmp[i].v2);
                    tmp.splice(i, 1);
                    break;
                }
            }

            if (loopCount++ > 1000) {
                break;
            }
        }

        verts.pop();

        return verts;
    };

    ngOnDestroy() {
        this.routeSub.unsubscribe();

        if (this.socket) {
            this.socket.close();
        }
    }
}

const ZoneMap = {
    facilityIcons: {},
    warpgates: {},
    facilities: {},
    regions: {},
    map: null,
    lattice: [],
    worldId: null,
    zoneId: null,
    eventLog: [],
    score: [0, 0, 0, 0],
    reset: function () {
        this.facilityIcons = {};
        this.warpgates = {};
        this.facilities = {};
        this.regions = {};
        this.map = null;
        this.lattice = [];
        this.worldId = null;
        this.zoneId = null;
        this.eventLog = [];
        this.score = [0, 0, 0, 0];
    }
};

const Factions = {
    0: {
        id: 0,
        code: 'ns',
        name: 'Nanite Systems'
    },
    1: {
        id: 1,
        code: 'vs',
        name: 'Vanu Soverignty'
    },
    2: {
        id: 2,
        code: 'nc',
        name: 'New Conglomerate'
    },
    3: {
        id: 3,
        code: 'tr',
        name: 'Terran Republic'
    }
}

const Zones = {
    2: {
        name: 'Indar'
    },
    4: {
        name: 'Hossin'
    },
    6: {
        name: 'Amerish'
    },
    8: {
        name: 'Esamir'
    }
}

const FactionColors = {
    ns: {
        'default': "#79e0e1",
        'dark': "#249c9e"
    },
    nc: {
        'default': "#33adff",
        'dark': "#1a5780"
    },
    tr: {
        'default': "#df2020",
        'dark': "#701010"
    },
    vs: {
        'default': "#9e52e0",
        'dark': "#4f2970"
    }
}

const RegionStyles = {
    ns: {
        "default": {
            weight: 1.2,
            color: '#000',
            opacity: 1,
            fillOpacity: 0,
            pane: 'regions'
        }
    },
    vs: {
        "default": {
            weight: 1.2,
            fillColor: FactionColors.vs["default"],
            fillOpacity: 0.4,
            color: '#000'
        },
        dark: {
            weight: 1.2,
            fillColor: FactionColors.vs.dark,
            fillOpacity: 0.7,
            color: '#000'
        }
    },
    nc: {
        "default": {
            weight: 1.2,
            fillColor: FactionColors.nc["default"],
            fillOpacity: 0.4,
            color: '#000'
        },
        dark: {
            weight: 1.2,
            fillColor: FactionColors.nc.dark,
            fillOpacity: 0.7,
            color: '#000'
        }
    },
    tr: {
        "default": {
            weight: 1.2,
            fillColor: FactionColors.tr["default"],
            fillOpacity: 0.4,
            color: '#000'
        },
        dark: {
            weight: 1.2,
            fillColor: FactionColors.tr.dark,
            fillOpacity: 0.7,
            color: '#000'
        }
    }
}

class ZoneFacility extends Marker {
    id: string;
    name: string;
    facilityType: string;
    faction: string = 'ns';
    region: any = null;
    facilities: any = [];
    lattice: any = [];

    constructor(latLng: LatLng, options?: MarkerOptions) {
        super(latLng, options);
    }

    isLinked(): boolean {
        let linked = [];
        let faction = this.faction;
        let id = this.id;

        let checkLinkedFacilities = function (facility): boolean {
            linked.push(facility.id);

            for (let i = 0; i < facility.facilities.length; i++) {
                var f = facility.facilities[i];
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

        return checkLinkedFacilities(ZoneMap.warpgates[faction]);
    }

    setFaction(faction: string) {
        this.faction = faction

        if (!this.setIcon) {
            return false;
        }

        return this.setIcon(ZoneMap.facilityIcons[this.facilityType][this.faction]);
    }
}

class ZoneRegion extends Polygon {
    id: string;
    name: string;
    faction: string = 'ns';
    facility: ZoneFacility = null;
    style: any = RegionStyles.ns['default'];

    constructor(latLngs: LatLng[], options?: PolylineOptions) {
        super(latLngs, options);
    }

    setFaction(faction: string) {
        this.faction = faction;

        if (this.facility && this.facility.isLinked()) {
            this.style = RegionStyles[this.faction]["default"];
        } else {
            this.style = RegionStyles[this.faction].dark;
        }

        this.setStyle(this.style);
    }
}

class VertexPoint {
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

class VertexLine {
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

class LatticeLink {
    facilityA: ZoneFacility;
    facilityB: ZoneFacility;
    facilities = {};
    faction: string = 'ns';

    outline: Polyline;
    line: Polyline;

    constructor(facilityA: ZoneFacility, facilityB: ZoneFacility) {
        this.facilityA = facilityA;
        this.facilityB = facilityB;

        this.facilities[facilityA.id] = facilityA;
        this.facilities[facilityB.id] = facilityB;

        if (this.facilityA.getLatLng() && this.facilityB.getLatLng()) {
            let points = [this.facilityA.getLatLng(), this.facilityB.getLatLng()];
            this.outline = polyline(points, this.colors.ns.outline).addTo(ZoneMap.map);
            this.line = polyline(points, this.colors.ns.line).addTo(ZoneMap.map);
        }
    }

    setFaction() {
        if (this.facilityA.faction == this.facilityB.faction) {
            this.faction = this.facilityA.faction;
        } else {
            this.faction = 'contested';
        }

        if (this.outline && this.line) {
            this.outline.setStyle(this.colors[this.faction].outline);
            this.line.setStyle(this.colors[this.faction].line);
        }
    }

    options = {
        pane: 'latticePane'
    };

    colors = {
        ns: {
            line: {
                color: FactionColors.ns["default"],
                pane: 'latticePane',
                weight: 2,
                clickable: false,
                dashArray: null,
                interactive: false
            },
            outline: {
                color: '#FFF',
                pane: 'latticePane',
                weight: 4,
                clickable: false,
                interactive: false
            }
        },
        nc: {
            line: {
                color: FactionColors.nc["default"],
                pane: 'latticePane',
                weight: 2,
                clickable: false,
                dashArray: null,
                interactive: false
            },
            outline: {
                color: '#FFF',
                pane: 'latticePane',
                weight: 4,
                clickable: false,
                interactive: false
            }
        },
        tr: {
            line: {
                color: FactionColors.tr["default"],
                pane: 'latticePane',
                weight: 2,
                clickable: false,
                dashArray: null,
                interactive: false
            },
            outline: {
                color: '#FFF',
                pane: 'latticePane',
                weight: 4,
                clickable: false,
                interactive: false
            }
        },
        vs: {
            line: {
                color: FactionColors.vs["default"],
                pane: 'latticePane',
                weight: 2,
                clickable: false,
                dashArray: null,
                interactive: false
            },
            outline: {
                color: '#FFF',
                pane: 'latticePane',
                weight: 4,
                clickable: false,
                interactive: false
            }
        },
        contested: {
            line: {
                color: '#FFFF00',
                pane: 'latticePane',
                weight: 3,
                clickable: false,
                dashArray: [6],
                interactive: false
            },
            outline: {
                color: '#000',
                pane: 'latticePane',
                weight: 5,
                clickable: false,
                interactive: false
            }
        }
    };
}