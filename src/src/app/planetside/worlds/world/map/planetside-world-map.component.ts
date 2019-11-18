import { Component, EventEmitter, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { PlanetsideWorldComponent } from './../planetside-world.component';
import { Factions } from './../../../shared/configs';
import { PlanetsideApi } from './../../../shared/services/planetside-api.service';
import { ZoneService } from '../../../shared/services/zone-service.service';

const SocketConfig = {
    Host: 'push.planetside2.com',
    Environment: 'ps2',
    ServiceKey: 'voidwell'
}

@Component({
    templateUrl: './planetside-world-map.template.html',
    styleUrls: ['./planetside-world-map.styles.css']
})

export class PlanetsideWorldMapComponent implements OnDestroy {
    private routeSub: Subscription;
    navLinks = [];
    worldId: number;
    socket: WebSocket;

    zoneLogs: { [zoneId: number]: any[] } = {};
    zones: any;

    onFacilityCapture: EventEmitter<any> = new EventEmitter();
    onFacilityDefend: EventEmitter<any> = new EventEmitter();
    onContinentLock: EventEmitter<any> = new EventEmitter();
    onContinentUnlock: EventEmitter<any> = new EventEmitter();

    playableZones: number[];

    constructor(private router: Router, private route: ActivatedRoute, private parent: PlanetsideWorldComponent, private api: PlanetsideApi, private zoneService: ZoneService) {
        this.worldId = this.parent.worldId;

        this.zoneService.Zones.subscribe(zones => {
            if (!zones) {
                return;
            }

            this.zones = zones;

            this.playableZones = this.zones.map(z => z.id);

            for (let idx in zones) {
                let zoneId = zones[idx].id;

                if (zoneId === 14 || zoneId > 90) {
                    continue;
                }

                this.zoneLogs[zoneId] = [];

                this.navLinks.push({
                    path: zoneId,
                    display: zones[idx].name
                });
            }

            this.connectWebsocket();
        });

        /*
        this.routeSub = this.route.params.subscribe(params => {
            if (!params['zoneId']) {
                this.router.navigate(['./', this.navLinks[0].path], { relativeTo: this.route });
            }
        });
        */
    }

    private getZoneName(zoneId: number): string {
        if (!this.zones) {
            return;
        }

        let zone = this.zones.filter(z => z.id === zoneId);
        if (zone.length > 0) {
            return zone[0].name;
        }

        return;
    }

    getZoneOwnership(zoneId: number): Observable<any> {
        return this.api.getZoneOwnership(this.worldId, zoneId);
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

        this.zoneLogs[zoneId].unshift(logData);

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
        this.zoneLogs[zoneId].unshift(logData);

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
            zone: this.getZoneName(zoneId),
            timestamp: timestamp
        };
        this.zoneLogs[zoneId].unshift(logData);

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
            zone: this.getZoneName(zoneId),
            timestamp: timestamp
        };
        this.zoneLogs[zoneId].unshift(logData);

        this.onContinentUnlock.emit(unlockData);
    }

    ngOnDestroy() {
        if (this.routeSub) {
            this.routeSub.unsubscribe();
        }
        if (this.socket) {
            this.socket.close();
        }
    }
}