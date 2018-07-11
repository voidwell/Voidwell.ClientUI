import { Component, Input, Output, OnInit, OnDestroy, OnChanges, EventEmitter } from '@angular/core';
import { Subscription, Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import {
    Map, tileLayer, latLng, MapOptions, latLngBounds, LatLngBounds, CRS, Layer, polygon, Polygon, PolylineOptions, LatLng,
    icon, IconOptions, marker, MarkerOptions, TooltipOptions, Marker, DivIcon, DivIconOptions, divIcon, Polyline, polyline
} from 'leaflet';
import { VertexPoint, VertexLine, ZoneRegion, ZoneFacility, LatticeLink } from './models';
import { Zones, Factions, FacilityTypes } from './../configs';
import { ZoneHelper, ZoneMap } from './../../zone-helper.service';

@Component({
    selector: 'ps2-zone-map',
    templateUrl: './ps2-zone-map.template.html',
    styleUrls: ['./ps2-zone-map.styles.css']
})

export class Ps2ZoneMapComponent implements OnInit, OnDestroy, OnChanges {
    @Input() zoneId: number;
    @Input() captureStream: Observable<any>;
    @Input() defendStream: Observable<any>;
    @Input() ownershipStream: Observable<any>;
    @Input() focusFacility: Observable<any>;

    @Output() score = new EventEmitter<any>();

    isLoading: boolean = true;
    errorMessage: string;

    map: Map;
    warpgates: { [facilityId: string]: ZoneFacility } = {};
    facilities: { [facilityId: string]: ZoneFacility } = {};
    regions: { [regionId: string]: ZoneRegion } = {};
    lattice: LatticeLink[] = [];

    zoneMap: ZoneMap;

    leafletOptions: MapOptions;
    fitBounds: LatLngBounds;

    ownershipSub: Subscription;
    zoneMapSub: Subscription;
    captureSub: Subscription;
    defendSub: Subscription;

    constructor(private zoneHelper: ZoneHelper) {
    }

    ngOnInit() {
        if (!this.zoneId) {
            return;
        }

        this.focusFacility.subscribe((facilityId: string) => {
            this.map.setView(this.facilities[facilityId].getLatLng(), 5);
        });
    }

    ngOnChanges() {
        this.map = null;
        this.warpgates = {};
        this.facilities = {};
        this.regions = {};
        this.lattice = [];

        this.score.emit([0, 0, 0, 0]);

        if (!this.zoneId) {
            return;
        }

        this.isLoading = true;
        this.setupMap();
    }

    setupMap() {
        let zoneName = Zones[this.zoneId].name;

        this.leafletOptions = {
            crs: CRS.Simple,
            layers: [
                tileLayer('/files/img/ps2/tiles/' + zoneName.toLowerCase() + '/zoom{z}/' + zoneName.toLowerCase() + '_{z}_{x}_{y}.jpg', {
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

        this.zoneMapSub = this.zoneHelper.getZoneMap(this.zoneId)
            .pipe<any>(catchError(error => {
                this.errorMessage = error._body
                this.isLoading = false;
                return throwError(error);
            }))
            .pipe<any>(finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(zoneMap => {
                this.zoneMap = zoneMap;
            });

        this.captureSub = this.captureStream.subscribe(event => {
            if (event.zoneId !== this.zoneId) {
                return;
            }

            let faction = Factions[event.factionId];
            let facilityId = event.facilityId;

            if (!this.facilities[facilityId]) {
                return;
            }

            this.facilities[facilityId].setFaction(faction.id);

            for (let idx in this.facilities[facilityId].lattice) {
                this.facilities[facilityId].lattice[idx].setFaction();
            }

            this.facilities[facilityId].region.setFaction(faction.id);

            this.updateScore();
        });

        this.defendSub = this.defendStream.subscribe(event => {
            if (event.zoneId !== this.zoneId) {
                return;
            }
        });
    }

    getFacilityName(facilityId: number): string {
        if (!this.facilities[facilityId]) {
            return facilityId.toString();
        }

        return this.facilities[facilityId].name;
    }

    onMapReady(map: Map) {
        this.map = map;

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

        this.ownershipSub = this.ownershipStream
            .subscribe(data => {
                if (!data) return;

                this.setupOwnership(data);
                this.updateScore();
            });

        map.fitBounds(latLngBounds(latLng(-128, -128), latLng(128, 128)));
    }

    setupMapMarkers() {
        let facilityGroups = this.groupBy(this.zoneMap.regions, 'facilityTypeId');

        for (let facilityTypeId in facilityGroups) {
            let facilities = this.groupBy(facilityGroups[facilityTypeId], 'facilityId');
            let facilityType = FacilityTypes[facilityTypeId].code;

            let markerOptions: MarkerOptions = {
                icon: this.zoneHelper.facilityIcons[facilityTypeId][0],
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
                for (var i = 0; i < this.zoneMap.links.length; i++) {
                    let link = this.zoneMap.links[i];
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

                let facilityMarker = new ZoneFacility(facilityLatLng, this.zoneHelper.facilityIcons, this.warpgates, markerOptions);
                if (facility.facilityName) {
                    facilityMarker.bindTooltip(facility.facilityName, tooltipOptions);
                    facilityMarker.name = facility.facilityName;
                }
                facilityMarker.id = facilityId;
                facilityMarker.facilityType = facility.facilityType;
                facilityMarker.facilityTypeId = facility.facilityTypeId;

                this.facilities[facilityId] = facilityMarker;

                if (facility.x && facility.z) {
                    facilityMarker.addTo(this.map);
                }
            }
        }
    }

    setupMapRegions() {
        let width = 50 / 8;

        let b = width / 2;
        let c = b / Math.sqrt(3) * 2;
        let a = c / 2;

        var regionHexs = this.groupBy(this.zoneMap.hexs, 'mapRegionId');

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

            region.addTo(this.map);

            this.regions[regionId] = region;
        }
    }

    setupMapLinks() {
        for (let linkIdx in this.zoneMap.links) {
            let link = this.zoneMap.links[linkIdx];
            let facilityA = this.facilities[link.facilityIdA];
            let facilityB = this.facilities[link.facilityIdB];

            let latticeLink = new LatticeLink(facilityA, facilityB);
            latticeLink.addTo(this.map);

            this.lattice.push(latticeLink);
        }

        for (let idx in this.zoneMap.regions) {
            let region = this.zoneMap.regions[idx];

            if (this.facilities[region.facilityId] && this.regions[region.regionId]) {
                this.regions[region.regionId].facility = this.facilities[region.facilityId];
                this.facilities[region.facilityId].region = this.regions[region.regionId];
            }
        }

        for (let idx in this.lattice) {
            var link = this.lattice[idx];

            for (let id in link.facilities) {
                let facility = link.facilities[id];
                this.facilities[facility.id].lattice.push(link);

                for (let linkedFacilityId in link.facilities) {
                    let linkedFacility = link.facilities[linkedFacilityId];
                    if (facility.id !== linkedFacility.id) {
                        this.facilities[facility.id].links.push(this.facilities[linkedFacility.id]);
                    }
                }
            }
        }
    }

    setupOwnership(data: any) {
        let regions = this.groupBy(data, 'regionId');

        let sameFaction = true;
        let prevFaction = null;

        for (let regionId in regions) {
            let region = regions[regionId][0];
            let faction = region.factionId;

            if (prevFaction === null) {
                prevFaction = faction;
            }

            if (prevFaction !== faction) {
                sameFaction = false;
            }

            if (this.regions[regionId] && this.regions[regionId].facility) {
                this.regions[regionId].facility.setFaction(faction);
            } else if (this.regions[regionId]) {
                this.regions[regionId].setFaction(faction);
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

        for (let regionId in this.regions) {
            let region = this.regions[regionId];
            if (region.facility && region.facility.facilityTypeId === 7) {
                let factionId = regions[regionId][0].factionId;
                this.warpgates[factionId] = region.facility;
            }
        }

        for (let i = 0; i < this.lattice.length; i++) {
            let link = this.lattice[i];
            link.setFaction();
        }

        for (let facilityId in this.facilities) {
            if (this.facilities[facilityId].region) {
                this.facilities[facilityId].region.setFaction(this.facilities[facilityId].faction);
            }
        }
    }

    updateScore() {
        let territories = {
            contested: 0,
            vs: -1,
            tr: -1,
            nc: -1
        };

        for (let facilityId in this.facilities) {
            let facility = this.facilities[facilityId];
            if (facility.isLinked()) {
                let faction = Factions[facility.faction].code;
                territories[faction] += 1;
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

        this.score.emit([territories.contested, territories.vs, territories.nc, territories.tr]);
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
        if (this.zoneMapSub) this.zoneMapSub.unsubscribe();
        if (this.ownershipSub) this.ownershipSub.unsubscribe();
        if (this.captureSub) this.captureSub.unsubscribe();
        if (this.defendSub) this.defendSub.unsubscribe();
    }
}