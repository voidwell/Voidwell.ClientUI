import { Component, ChangeDetectionStrategy, EventEmitter, OnDestroy, effect, inject, untracked } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { PlanetsideWorldComponent } from '../planetside-world.component';
import { Factions } from '../../../data/configs';
import { ZoneService } from '../../../data/zone.service';
import { WorldStateRepository } from '@core/api/ps2/world-state.repository';
import { ZoneRegionOwnership } from '@core/api/models/ps2/map.model';
import { FacilityEvent } from '../../../components/ps2-zone-map/ps2-zone-map.component';
import { VWTabNavSubBarComponent } from '@shared/ui/vw-tab-nav-sub-bar/vw-tab-nav-sub-bar.component';

/** A message of the Census event streaming service; all values arrive as strings. */
interface CensusEventPayload {
    event_name: string;
    timestamp: string;
    zone_id: string;
    facility_id?: string;
    new_faction_id?: string;
    old_faction_id?: string;
    triggering_faction?: string;
}

interface CensusMessage {
    type?: string;
    payload?: CensusEventPayload;
}

/** A continent being locked or unlocked. */
export interface ContinentEvent {
    timestamp: Date;
    zoneId: number;
    factionId?: string;
}

/** A line of the zone's event log. */
export interface ZoneLogEntry {
    event: 'capture' | 'defend' | 'continent_lock' | 'continent_unlock';
    facilityId?: number | string;
    faction?: { id: number; code: string; name: string };
    zone?: string;
    timestamp: Date;
}

const SocketConfig = {
    Host: 'push.planetside2.com',
    Environment: 'ps2',
    ServiceKey: 'voidwell'
}

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './planetside-world-map.component.html',
    styleUrls: ['./planetside-world-map.component.css'],
    imports: [VWTabNavSubBarComponent, RouterOutlet]
})

export class PlanetsideWorldMapComponent implements OnDestroy {
    private parent = inject(PlanetsideWorldComponent);
    private worldStateRepository = inject(WorldStateRepository);
    private zoneService = inject(ZoneService);

    private routeSub: Subscription;
    readonly navLinks = this.zoneService.zoneNavLinks;
    worldId: number;
    socket: WebSocket;

    zoneLogs: { [zoneId: number]: ZoneLogEntry[] } = {};

    onFacilityCapture: EventEmitter<FacilityEvent> = new EventEmitter<FacilityEvent>();
    onFacilityDefend: EventEmitter<FacilityEvent> = new EventEmitter<FacilityEvent>();
    onContinentLock: EventEmitter<ContinentEvent> = new EventEmitter<ContinentEvent>();
    onContinentUnlock: EventEmitter<ContinentEvent> = new EventEmitter<ContinentEvent>();

    constructor() {
        this.worldId = this.parent.worldId();

        // connect once the zones are known
        effect(() => {
            if (!this.zoneService.zones() || this.socket) {
                return;
            }

            untracked(() => {
                for (const link of this.navLinks()) {
                    this.zoneLogs[Number(link.path)] = [];
                }

                this.connectWebsocket();
            });
        });

    }

    private getZoneName(zoneId: number): string | undefined {
        return this.zoneService.zoneName(zoneId);
    }

    getZoneOwnership(zoneId: number): Observable<ZoneRegionOwnership[]> {
        return this.worldStateRepository.getZoneOwnership(this.worldId, zoneId);
    }

    connectWebsocket() {
        const socketUrl = 'wss://' + SocketConfig.Host + '/streaming?environment=' + SocketConfig.Environment + '&service-id=s:' + SocketConfig.ServiceKey;
        this.socket = new WebSocket(socketUrl);

        this.socket.onerror = (e) => {
            console.error('Websocket Error:', e);
        };

        this.socket.onopen = () => {
            const subscription = {
                service: 'event',
                action: 'subscribe',
                worlds: [this.worldId],
                eventNames: [
                    'FacilityControl',
                    'ContinentLock',
                    'ContinentUnlock'
                ]
            };

            this.socket.send(JSON.stringify(subscription));
        };

        this.socket.onmessage = (message) => {
            const data: CensusMessage = JSON.parse(message.data);

            if (data.type !== 'serviceMessage' || !data.payload) {
                return;
            }

            this.processEvent(data.payload);
        };
    }

    processEvent(payload: CensusEventPayload) {
        const timestamp = new Date(Number(payload.timestamp) * 1000);
        const zoneId = parseInt(payload.zone_id);

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

    facilityCaptureEvent(timestamp: Date, zoneId: number, payload: CensusEventPayload) {
        const defendData: FacilityEvent = {
            timestamp: timestamp.toISOString(),
            zoneId: zoneId,
            facilityId: payload.facility_id,
            factionId: payload.new_faction_id
        };

        if (this.zoneService.zoneIds().indexOf(zoneId) === -1) {
            return;
        }

        const logData: ZoneLogEntry = {
            event: 'capture',
            facilityId: defendData.facilityId,
            faction: Factions[Number(defendData.factionId)],
            timestamp: timestamp
        };

        this.zoneLogs[zoneId].unshift(logData);

        this.onFacilityCapture.emit(defendData);
    }

    facilityDefendEvent(timestamp: Date, zoneId: number, payload: CensusEventPayload) {
        const captureData: FacilityEvent = {
            timestamp: timestamp.toISOString(),
            zoneId: zoneId,
            facilityId: payload.facility_id,
            factionId: payload.new_faction_id
        };

        if (this.zoneService.zoneIds().indexOf(zoneId) === -1) {
            return;
        }

        const logData: ZoneLogEntry = {
            event: 'defend',
            facilityId: captureData.facilityId,
            faction: Factions[Number(captureData.factionId)],
            timestamp: timestamp
        };
        this.zoneLogs[zoneId].unshift(logData);

        this.onFacilityDefend.emit(captureData);
    }

    continentLockEvent(timestamp: Date, zoneId: number, payload: CensusEventPayload) {
        const lockData: ContinentEvent = {
            timestamp: timestamp,
            zoneId: zoneId,
            factionId: payload.triggering_faction
        };

        if (this.zoneService.zoneIds().indexOf(zoneId) === -1) {
            return;
        }

        const logData: ZoneLogEntry = {
            event: 'continent_lock',
            faction: Factions[Number(lockData.factionId)],
            zone: this.getZoneName(zoneId),
            timestamp: timestamp
        };
        this.zoneLogs[zoneId].unshift(logData);

        this.onContinentLock.emit(lockData);
    }

    continentUnlockEvent(timestamp: Date, zoneId: number) {
        const unlockData: ContinentEvent = {
            timestamp: timestamp,
            zoneId: zoneId
        };

        if (this.zoneService.zoneIds().indexOf(zoneId) === -1) {
            return;
        }

        const logData: ZoneLogEntry = {
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
