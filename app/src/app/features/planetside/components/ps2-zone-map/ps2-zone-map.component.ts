import { Component, Input, Output, OnInit, OnDestroy, OnChanges, EventEmitter, effect, inject, untracked, input } from '@angular/core';
import { Subscription, Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import {
    Map, tileLayer, latLng, LatLng, MapOptions, latLngBounds, LatLngBounds, CRS, PolylineOptions,
    MarkerOptions, TooltipOptions, LeafletKeyboardEvent
} from 'leaflet';
import { VertexPoint, VertexLine, ZoneRegion, ZoneFacility, LatticeLink } from './models';
import { Factions, FacilityTypes } from '../../data/configs';
import { ZoneHelper, ZoneMap } from '../../data/zone-helper.service';
import { ZoneService } from '../../data/zone.service';
import { Zone } from '@core/api/models/ps2/reference.model';
import { ZoneRegionOwnership } from '@core/api/models/ps2/map.model';

/** A facility changing hands, as streamed to the map by the live world view or a replay. */
export interface FacilityEvent {
    zoneId: number;
    facilityId: number | string;
    factionId: number | string;
    noFlash?: boolean;
    timestamp?: string;
}
import { getErrorMessage } from '@core/util/error-message';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { LeafletDirective } from '@bluehalo/ngx-leaflet';

@Component({
    selector: 'ps2-zone-map',
    templateUrl: './ps2-zone-map.component.html',
    styleUrls: ['./ps2-zone-map.component.css'],
    imports: [LoaderComponent, ErrorMessageComponent, LeafletDirective]
})

export class Ps2ZoneMapComponent implements OnInit, OnDestroy, OnChanges {
    private zoneHelper = inject(ZoneHelper);
    private zoneService = inject(ZoneService);

    @Input() zoneId: number;
    @Input() captureStream: Observable<FacilityEvent>;
    @Input() defendStream: Observable<FacilityEvent>;
    /** Which faction owns each region; reapplied whenever it changes. */
    readonly ownership = input<ZoneRegionOwnership[] | null>(null);
    @Input() focusFacility: Observable<number | string>;
    @Input() hideOverlay: boolean = false;

    @Output() score = new EventEmitter<number[]>();
    @Output() hexSelected = new EventEmitter<ZoneRegion>();

    activeZoneId: number;
    private zoneMapRequested = false;

    constructor() {
        effect(() => {
            const ownership = this.ownership();
            untracked(() => this.applyOwnership(ownership));
        });

        effect(() => {
            this.zoneService.zones();
            untracked(() => this.setupWhenZonesLoaded());
        });
    }

    isLoading: boolean = true;
    errorMessage: string;
    zones: Zone[];
    popupsEnabled: boolean = false;

    map: Map;
    warpgates: ZoneFacility[] = [];
    facilities: { [facilityId: string]: ZoneFacility } = {};
    regions: { [regionId: string]: ZoneRegion } = {};
    lattice: LatticeLink[] = [];

    zoneMap: ZoneMap;

    leafletOptions: MapOptions;
    fitBounds: LatLngBounds;

    zoneMapSub: Subscription;
    captureSub: Subscription;
    defendSub: Subscription;

    ngOnInit() {
        if (!this.zoneId) {
            return;
        }

        this.activeZoneId = this.zoneId;

        if (this.focusFacility) {
            this.focusFacility.subscribe((facilityId) => {
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

        this.zoneMapRequested = true;
        this.setupWhenZonesLoaded();
    }

    private applyOwnership(data: ZoneRegionOwnership[] | null) {
        if (!data || !this.map) {
            return;
        }

        setTimeout(() => {
            this.setupOwnership(data);
            this.updateScore();
        }, 10);
    }

    /** Sets the map up once a zone map has been requested and the zone list is available. */
    private setupWhenZonesLoaded() {
        const zones = this.zoneService.zones();
        if (!this.zoneMapRequested || !zones) {
            return;
        }

        this.zoneMapRequested = false;
        this.zones = zones;
        this.setupMap();
    }

    setupMap() {
        let zoneName = '';

        const zone = this.zones.filter(zone => zone.id.toString() === this.zoneId.toString());
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
            .pipe(catchError(error => {
                this.errorMessage = getErrorMessage(error)
                this.isLoading = false;
                return throwError(() => error);
            }))
            .pipe(finalize(() => {
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

    updateMapEvent(facilityId: number | string, factionId: number | string, noFlash: boolean = false) {
        const faction = Factions[Number(factionId)];

        if (!this.facilities[facilityId]) {
            return;
        }

        this.facilities[facilityId].setFaction(faction.id);

        for (const idx in this.facilities[facilityId].lattice) {
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
        this.map = map;

        map.createPane('regions');
        map.createPane('latticePane');
        map.createPane('markerPane');
        map.createPane('markerLabelsPane');
        map.createPane('facilitiesPane');
        map.createPane('facilitiesLabelsPane');
        map.createPane('outpostsPane');
        map.createPane('outpostsLabelsPane');

        const mapZoom = () => {
            const elem = document.querySelector('.leaflet-map-pane');
            elem.setAttribute('data-zoom', String(map.getZoom()));
        };

        map.on('zoomend', mapZoom).fireEvent('zoomend');
        map.on("keypress", (e: LeafletKeyboardEvent) => {
            const key = e.originalEvent.key;

            switch(key) {
                case "w":
                    this.popupsEnabled = !this.popupsEnabled;
                    if (this.popupsEnabled) {
                        Object.keys(this.regions).map(regionId => this.regions[regionId].enablePopup())
                    } else {
                        Object.keys(this.regions).map(regionId => this.regions[regionId].disablePopup())
                        this.map.closePopup();
                    }
                    break;
            }
        });

        this.setupMapMarkers();
        this.setupMapRegions();
        this.setupMapLinks();

        this.applyOwnership(this.ownership());

        map.fitBounds(latLngBounds(latLng(-128, -128), latLng(128, 128)));
    }

    setupMapMarkers() {
        const facilityGroups = this.groupBy(this.zoneMap.regions, 'facilityTypeId');

        for (const facilityTypeId in facilityGroups) {
            const facilities = this.groupBy(facilityGroups[facilityTypeId], 'facilityId');
            const facilityType = FacilityTypes[Number(facilityTypeId)].code;

            const markerOptions: MarkerOptions = {
                pane: 'markerPane'
            };

            if (this.zoneHelper.facilityIcons[Number(facilityTypeId)]) {
                markerOptions.icon = this.zoneHelper.facilityIcons[Number(facilityTypeId)][0]
            }

            const tooltipOptions: TooltipOptions = {
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

            for (const facilityId in facilities) {
                const facility = facilities[facilityId][0];

                let hasLinks = false;
                for (let i = 0; i < this.zoneMap.links.length; i++) {
                    const link = this.zoneMap.links[i];
                    if (String(link.facilityIdA) === facilityId || String(link.facilityIdB) === facilityId) {
                        hasLinks = true;
                        break;
                    }
                }

                if (!hasLinks) {
                    continue;
                }

                let facilityLatLng: LatLng | undefined;
                if (facility.x && facility.z) {
                    const x = facility.x * 0.03126;
                    const z = facility.z * 0.03126;
                    facilityLatLng = latLng(x, z);
                }

                const facilityMarker = new ZoneFacility(facilityLatLng, this.zoneHelper.facilityIcons, this.warpgates, markerOptions);
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

        const hexScale = 1/32;
        const hexSize = hexScale * (this.zoneMap.hexSize || 200);
        const heightOffset = hexSize / 2;
        const widthOffset = hexSize / Math.sqrt(3);
        const d = widthOffset / 2;

        const regionHexs = this.groupBy(this.zoneMap.hexs, 'mapRegionId');

        for (const regionId in regionHexs) {
            const regionData = this.zoneMap.regions.find(r => String(r.regionId) === regionId);

            if (regionId === '0' || regionData === undefined) {
                continue;
            }

            const hexs = regionHexs[regionId];

            let regionLines: VertexLine[] = [];

            for (const hexIdx in hexs) {
                const hex = hexs[hexIdx];            

                if (hex.hexType === 1) {
                    continue;
                }

                let x: number;
                if (hex.y % 2 == 1) {
                    const t = Math.floor(hex.y / 2);
                    x = widthOffset * t + 2 * widthOffset * (t + 1) + widthOffset / 2;
                } else {
                    x = (3 * widthOffset * hex.y) / 2 + widthOffset;
                }

                const y = (2 * hex.x + hex.y) * heightOffset;

                const hexVerts = [
                    new VertexPoint(x - d, y - heightOffset),
                    new VertexPoint(x - widthOffset, y),
                    new VertexPoint(x - d, y + heightOffset),
                    new VertexPoint(x + d, y + heightOffset),
                    new VertexPoint(x + widthOffset, y),
                    new VertexPoint(x + d, y - heightOffset)
                ];

                const hexLines = [
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

            const regionOuterLines = this.getOuterLines(regionLines);
            const regionOuterVerts = this.getOuterVerts(regionOuterLines);

            const latLngVerts = regionOuterVerts.map((a) => { return a.toLatLng() });

            const options: PolylineOptions = {
                weight: 1.2,
                color: '#000',
                opacity: 1,
                fillOpacity: 0,
                pane: 'regions'
            };

            const region = new ZoneRegion(regionId, latLngVerts, options)
                .on('mouseover', (e) => {
                    return e.target.bringToFront().setStyle({
                        weight: 3,
                        color: '#FFF'
                    });
                })
                .on('mouseout', (e) => {
                    return e.target.setStyle({
                        weight: 1.2,
                        color: '#000'
                    });
                })
                .on("click", (e) => {
                    this.hexSelected.emit(region);
                });

            region.addTo(this.map);

            this.regions[regionId] = region;
        }
    }

    setupMapLinks() {
        for (const linkIdx in this.zoneMap.links) {
            const link = this.zoneMap.links[linkIdx];
            const facilityA = this.facilities[link.facilityIdA];
            const facilityB = this.facilities[link.facilityIdB];

            const latticeLink = new LatticeLink(facilityA, facilityB);
            latticeLink.addTo(this.map);

            this.lattice.push(latticeLink);
        }

        for (const idx in this.zoneMap.regions) {
            const region = this.zoneMap.regions[idx];

            if (this.facilities[region.facilityId] && this.regions[region.regionId]) {
                this.regions[region.regionId].facility = this.facilities[region.facilityId];
                this.facilities[region.facilityId].region = this.regions[region.regionId];
            }
        }

        for (const idx in this.lattice) {
            const link = this.lattice[idx];

            for (const id in link.facilities) {
                const facility = link.facilities[id];
                this.facilities[facility.id].lattice.push(link);

                for (const linkedFacilityId in link.facilities) {
                    const linkedFacility = link.facilities[linkedFacilityId];
                    if (facility.id !== linkedFacility.id) {
                        this.facilities[facility.id].links.push(this.facilities[linkedFacility.id]);
                    }
                }
            }
        }
    }

    setupOwnership(data: ZoneRegionOwnership[]) {
        const regions = this.groupBy(data, 'regionId');

        for (const regionId in regions) {
            const region = regions[regionId][0];
            const faction = region.factionId;

            if (this.regions[regionId] && this.regions[regionId].facility) {
                this.regions[regionId].facility.setFaction(faction);
            } else if (this.regions[regionId]) {
                this.regions[regionId].setFaction(faction, true);
            }
        }

        for (let i = 0; i < this.lattice.length; i++) {
            const link = this.lattice[i];
            link.setFaction();
        }

        for (const facilityId in this.facilities) {
            if (this.facilities[facilityId].region) {
                this.facilities[facilityId].region.setFaction(this.facilities[facilityId].faction, true);
            }
        }
    }

    updateScore() {
        const territories: Record<string, number> = {
            contested: 0,
            vs: -1,
            tr: -1,
            nc: -1
        };

        for (const facilityId in this.facilities) {
            const facility = this.facilities[facilityId];
            if (facility.isLinked()) {
                const faction = Factions[facility.faction].code;
                territories[faction] += 1;
            } else {
                territories.contested += 1;
            }
        }

        const total = territories.vs + territories.nc + territories.tr + territories.contested;

        for (const faction in territories) {
            const territory = territories[faction];
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

    groupBy<T>(xs: T[], key: keyof T): Record<string, T[]> {
        return xs.reduce((rv: Record<string, T[]>, x) => {
            (rv[String(x[key])] = rv[String(x[key])] || []).push(x);
            return rv;
        }, {});
    };

    getOuterLines(lines: VertexLine[]): VertexLine[] {
        const outerLines: VertexLine[] = [];

        for (let i = 0; i < lines.length; i++) {
            let count = 1;

            for (let k = 0; k < lines.length; k++) {
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
        const tmp: VertexLine[] = [...lines];

        const verts = [tmp[0].v1, tmp[0].v2];
        tmp.splice(0, 1);

        let loopCount = 0;
        while (tmp.length > 0) {
            for (let i = 0; i < tmp.length; i++) {
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
        if (this.captureSub) this.captureSub.unsubscribe();
        if (this.defendSub) this.defendSub.unsubscribe();
    }
}