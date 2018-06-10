import { Component, EventEmitter, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { PlanetsideWorldComponent } from './../planetside-world.component';
import { Zones, Factions } from './../../../shared/configs';
import { WorldMaps, ZoneMap } from './models';
import { PlanetsideApi } from './../../../planetside-api.service';

const SocketConfig = {
    Host: 'push.planetside2.com',
    Environment: 'ps2',
    ServiceKey: 'voidwell'
}

@Component({
    templateUrl: './planetside-world-map.template.html'
})

export class PlanetsideWorldMapComponent implements OnDestroy {
    navLinks = [];
    worldId: number;
    socket: WebSocket;

    worldMaps: WorldMaps = new WorldMaps();

    onFacilityCapture: EventEmitter<any> = new EventEmitter();
    onFacilityDefend: EventEmitter<any> = new EventEmitter();
    onContinentLock: EventEmitter<any> = new EventEmitter();
    onContinentUnlock: EventEmitter<any> = new EventEmitter();

    playableZones: number[] = Object.keys(Zones).map(function (z) { return parseInt(z); });

    constructor(private parent: PlanetsideWorldComponent, private api: PlanetsideApi) {
        this.worldId = this.parent.worldId;

        for (let zoneId in Zones) {
            this.worldMaps.zoneLogs[zoneId] = [];

            this.navLinks.push({
                path: zoneId,
                display: Zones[zoneId].name
            });
        }

        this.connectWebsocket();
    }

    getZoneOwnership(zoneId: number): Observable<any> {
        return this.api.getZoneOwnership(this.worldId, zoneId);
    }

    getZoneMap(zoneId: number): Observable<ZoneMap> {
        return new Observable<ZoneMap>(observer => {
            if (this.worldMaps[zoneId]) {
                setTimeout(() => {
                    observer.next(this.worldMaps[zoneId]);
                    observer.complete();
                }, 10);
            } else {
                this.api.getZoneMap(zoneId)
                    .subscribe(data => {
                        var map = new ZoneMap();
                        map.hexs = data.hexs;
                        map.regions = data.regions;
                        map.links = data.links;

                        this.worldMaps[zoneId] = map;

                        observer.next(this.worldMaps[zoneId]);
                        observer.complete();
                    });
            }
        });
    }

    connectWebsocket() {
        let self = this;

        let socketUrl = 'wss://' + SocketConfig.Host + '/streaming?environment=' + SocketConfig.Environment + '&service-id=s:' + SocketConfig.ServiceKey;
        this.socket = new WebSocket(socketUrl);

        this.socket.onerror = function (e) {
            console.error('Websocket Error:', e);
        };

        this.socket.onopen = function () {
            let subscription = {
                service: 'event',
                action: 'subscribe',
                worlds: [self.worldId],
                eventNames: [
                    'FacilityControl',
                    'ContinentLock',
                    'ContinentUnlock'
                ]
            };

            this.send(JSON.stringify(subscription));
        };

        this.socket.onmessage = function (message) {
            let data = JSON.parse(message.data);

            if (data.type !== 'serviceMessage' || !data.payload) {
                return;
            }

            self.processEvent(data.payload);
        };
    }

    processEvent(payload: any) {
        let timestamp = new Date(payload.timestamp * 1000);
        let zoneId = parseInt(payload.zone_id);

        switch (payload.event_name) {
            case 'FacilityControl':
                if (payload.new_faction_id === payload.old_faction_id) {
                    this.facilityDefendEvent(timestamp, zoneId, payload);
                } else {
                    this.facilityCaptureEvent(timestamp, zoneId, payload);
                }
                break;
            case 'ContinentLock':
                this.continentLockEvent(timestamp, zoneId, payload);
                break;
            case 'ContinentUnlock':
                this.continentUnlockEvent(timestamp, zoneId);
                break;
        }
    }

    facilityCaptureEvent(timestamp: Date, zoneId: number, payload: any) {
        let defendData = {
            timestamp: timestamp,
            zoneId: zoneId,
            facilityId: payload.facility_id,
            factionId: payload.new_faction_id
        };

        if (this.playableZones.indexOf(zoneId) === -1) {
            return;
        }

        let logData = {
            event: 'capture',
            facilityId: defendData.facilityId,
            faction: Factions[defendData.factionId],
            timestamp: timestamp
        };

        this.worldMaps.zoneLogs[zoneId].unshift(logData);

        this.onFacilityCapture.emit(defendData);
    }

    facilityDefendEvent(timestamp: Date, zoneId: number, payload: any) {
        let captureData = {
            timestamp: timestamp,
            zoneId: zoneId,
            facilityId: payload.facility_id,
            factionId: payload.new_faction_id
        };

        if (this.playableZones.indexOf(zoneId) === -1) {
            return;
        }

        let logData = {
            event: 'defend',
            facilityId: captureData.facilityId,
            faction: Factions[captureData.factionId],
            timestamp: timestamp
        };
        this.worldMaps.zoneLogs[zoneId].unshift(logData);

        this.onFacilityDefend.emit(captureData);
    }

    continentLockEvent(timestamp: Date, zoneId: number, payload: any) {
        let lockData = {
            timestamp: timestamp,
            zoneId: zoneId,
            factionId: payload.triggering_faction
        };

        if (this.playableZones.indexOf(zoneId) === -1) {
            return;
        }

        let logData = {
            event: 'continent_lock',
            faction: Factions[lockData.factionId],
            zone: Zones[zoneId],
            timestamp: timestamp
        };
        this.worldMaps.zoneLogs[zoneId].unshift(logData);

        this.onContinentLock.emit(lockData);
    }

    continentUnlockEvent(timestamp: Date, zoneId: number) {
        let unlockData = {
            timestamp: timestamp,
            zoneId: zoneId
        };

        if (this.playableZones.indexOf(zoneId) === -1) {
            return;
        }

        let logData = {
            event: 'continent_unlock',
            zone: Zones[zoneId],
            timestamp: timestamp
        };
        this.worldMaps.zoneLogs[zoneId].unshift(logData);

        this.onContinentUnlock.emit(unlockData);
    }

    ngOnDestroy() {
        if (this.socket) {
            this.socket.close();
        }
    }
}