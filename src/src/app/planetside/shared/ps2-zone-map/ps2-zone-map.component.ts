import { Component, Input, Output, OnInit, OnDestroy, OnChanges, EventEmitter } from '@angular/core';
import { Subscription, Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import {
    Map, tileLayer, latLng, MapOptions, latLngBounds, LatLngBounds, CRS, PolylineOptions,
    MarkerOptions, TooltipOptions
} from 'leaflet';
import { VertexPoint, VertexLine, ZoneRegion, ZoneFacility, LatticeLink } from './models';
import { Factions, FacilityTypes } from './../configs';
import { ZoneHelper, ZoneMap } from './../../shared/services/zone-helper.service';
import { ZoneService } from '../services/zone-service.service';

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
    @Input() hideOverlay: boolean = false;

    @Output() score = new EventEmitter<any>();
    @Output() onHexSelected = new EventEmitter<ZoneRegion>();

    activeZoneId: number;
    isLoading: boolean = true;
    errorMessage: string;
    zones: any;
    popupsEnabled: boolean = false;

    map: Map;
    warpgates: ZoneFacility[] = [];
    facilities: { [facilityId: string]: ZoneFacility } = {};
    regions: { [regionId: string]: ZoneRegion } = {};
    lattice: LatticeLink[] = [];

    zoneMap: ZoneMap;

    leafletOptions: MapOptions;
    fitBounds: LatLngBounds;

    zoneListSub: Subscription
    ownershipSub: Subscription;
    zoneMapSub: Subscription;
    captureSub: Subscription;
    defendSub: Subscription;

    constructor(private zoneHelper: ZoneHelper, private zoneService: ZoneService) {
    }

    ngOnInit() {
        if (!this.zoneId) {
            return;
        }

        this.activeZoneId = this.zoneId;

        if (this.focusFacility) {
            this.focusFacility.subscribe((facilityId: string) => {
                this.map.setView(this.facilities[facilityId].getLatLng(), 5);
            });
        }
    }

    ngOnChanges() {
        if (this.zoneId === this.activeZoneId) {
            return;
        }

        this.activeZoneId = this.zoneId;
        this.map = null;
        this.warpgates = [];
        this.facilities = {};
        this.regions = {};
        this.lattice = [];

        this.score.emit([0, 0, 0, 0]);

        if (!this.zoneId) {
            return;
        }

        this.isLoading = true;

        this.zoneListSub = this.zoneService.Zones.subscribe(zones => {
            if (!zones) {
                return;
            }

            this.zones = zones;
            this.setupMap();
        });
    }

    setupMap() {
        let zoneName = '';

        let zone = this.zones.filter(zone => zone.id.toString() === this.zoneId.toString());
        if (zone.length > 0) {
            zoneName = zone[0].name;
        }

        this.leafletOptions = {
            crs: CRS.Simple,
            layers: [
                tileLayer('/files/img/ps2/tiles/' + zoneName.toLowerCase() + '/zoom{z}/' + zoneName.toLowerCase() + '_{z}_{x}_{y}.jpg', {
                    minZoom: 1,
                    maxZoom: 6,
                    maxNativeZoom: 5,
                    noWrap: true,
                    bounds: latLngBounds(latLng(-128, -128), latLng(128, 128))
                })
            ],
            attributionControl: false,
            center: latLng(0, 0),
            zoom: 0
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

        if (this.captureStream) {
            this.captureSub = this.captureStream.subscribe(event => {
                if (event.zoneId !== this.zoneId) {
                    return;
                }
    
                this.updateMapEvent(event.facilityId, event.factionId, event.noFlash);
            });
        }

        if (this.defendStream) {
            this.defendSub = this.defendStream.subscribe(event => {
                if (event.zoneId !== this.zoneId) {
                    return;
                }
    
                this.updateMapEvent(event.facilityId, event.factionId);
            });
        }
    }

    updateMapEvent(facilityId, factionId, noFlash: boolean = false) {
        let faction = Factions[factionId];

        if (!this.facilities[facilityId]) {
            return;
        }

        this.facilities[facilityId].setFaction(faction.id);

        for (let idx in this.facilities[facilityId].lattice) {
            this.facilities[facilityId].lattice[idx].setFaction();
        }

        this.facilities[facilityId].region.setFaction(faction.id, noFlash);

        this.updateScore();
    }

    getFacilityName(facilityId: number): string {
        if (!this.facilities[facilityId]) {
            return facilityId.toString();
        }

        return this.facilities[facilityId].name;
    }

    onMapReady(map: Map) {
        let self = this;
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
        map.on("keypress", function(e: any) {
            let key = e.originalEvent.key;

            switch(key) {
                case "w":
                    self.popupsEnabled = !self.popupsEnabled;
                    if (self.popupsEnabled) {
                        Object.keys(self.regions).map(regionId => self.regions[regionId].enablePopup())
                    } else {
                        Object.keys(self.regions).map(regionId => self.regions[regionId].disablePopup())
                        self.map.closePopup();
                    }
                    break;
            }
        });

        this.setupMapMarkers();
        this.setupMapRegions();
        this.setupMapLinks();

        if (this.ownershipStream) {
            this.ownershipSub = this.ownershipStream
            .subscribe(data => {
                if (!data) return;

                setTimeout(function () {
                    self.setupOwnership(data);
                    self.updateScore();
                }, 10);
            });
        }

        map.fitBounds(latLngBounds(latLng(-128, -128), latLng(128, 128)));
    }

    setupMapMarkers() {
        let facilityGroups = this.groupBy(this.zoneMap.regions, 'facilityTypeId');

        for (let facilityTypeId in facilityGroups) {
            let facilities = this.groupBy(facilityGroups[facilityTypeId], 'facilityId');
            let facilityType = FacilityTypes[facilityTypeId].code;

            let markerOptions: MarkerOptions = {
                pane: 'markerPane'
            };

            if (this.zoneHelper.facilityIcons[facilityTypeId]) {
                markerOptions.icon = this.zoneHelper.facilityIcons[facilityTypeId][0]
            }

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
                case 'seapost':
                    markerOptions.pane = 'facilitiesPane';
                    tooltipOptions.pane = 'facilitiesLabelsPane';
                    break;
                case 'large_outpost':
                case 'small_outpost':
                case 'construction_outpost':
                case 'large_outpost_ctf':
                case 'small_outpost_ctf':
                case 'construction_outpost_ctf':
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

                if (facility && facility.facilityTypeId === 7) {
                    this.warpgates.push(facilityMarker);
                }

                if (facility.x && facility.z) {
                    facilityMarker.addTo(this.map);
                }
            }
        }
    }

    setupMapRegions() {
        let self = this;

        let hexScale = 1/32;
        let hexSize = hexScale * (this.zoneMap.hexSize || 200);
        let heightOffset = hexSize / 2;
        let widthOffset = hexSize / Math.sqrt(3);
        let d = widthOffset / 2;

        var regionHexs = this.groupBy(this.zoneMap.hexs, 'mapRegionId');

        for (var regionId in regionHexs) {
            let regionData = this.zoneMap.regions.find(r => r.regionId == regionId);

            if (regionId === '0' || regionData === undefined) {
                continue;
            }

            var hexs = regionHexs[regionId];

            let regionLines: VertexLine[] = [];

            for (var hexIdx in hexs) {
                var hex = hexs[hexIdx];            

                if (hex.hexType === 1) {
                    continue;
                }

                var x;
                if (hex.y % 2 == 1) {
                    let t = Math.floor(hex.y / 2);
                    x = widthOffset * t + 2 * widthOffset * (t + 1) + widthOffset / 2;
                } else {
                    x = (3 * widthOffset * hex.y) / 2 + widthOffset;
                }

                var y = (2 * hex.x + hex.y) * heightOffset;

                var hexVerts = [
                    new VertexPoint(x - d, y - heightOffset),
                    new VertexPoint(x - widthOffset, y),
                    new VertexPoint(x - d, y + heightOffset),
                    new VertexPoint(x + d, y + heightOffset),
                    new VertexPoint(x + widthOffset, y),
                    new VertexPoint(x + d, y - heightOffset)
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

            if (regionLines.length === 0) {
                continue;
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

            let region = new ZoneRegion(regionId, latLngVerts, options)
                .on('mouseover', function (e) {
                    return e.target.bringToFront().setStyle({
                        weight: 3,
                        color: '#FFF'
                    });
                })
                .on('mouseout', function (e) {
                    return e.target.setStyle({
                        weight: 1.2,
                        color: '#000'
                    });
                })
                .on("click", function (e) {
                    self.onHexSelected.emit(region);
                });

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
                this.regions[regionId].setFaction(faction, true);
            }
        }

        for (let i = 0; i < this.lattice.length; i++) {
            let link = this.lattice[i];
            link.setFaction();
        }

        for (let facilityId in this.facilities) {
            if (this.facilities[facilityId].region) {
                this.facilities[facilityId].region.setFaction(this.facilities[facilityId].faction, true);
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
        if (this.zoneListSub) this.zoneListSub.unsubscribe();
        if (this.zoneMapSub) this.zoneMapSub.unsubscribe();
        if (this.ownershipSub) this.ownershipSub.unsubscribe();
        if (this.captureSub) this.captureSub.unsubscribe();
        if (this.defendSub) this.defendSub.unsubscribe();
    }
}