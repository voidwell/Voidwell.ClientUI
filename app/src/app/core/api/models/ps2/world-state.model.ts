import { IsoDateString, PopulationPeriod } from './common.model';

export type ZoneLockStateKind = 'LOCKED' | 'UNLOCKED';

export interface ZoneLockState {
    state: ZoneLockStateKind;
    timestamp: IsoDateString;
    metagameEventId?: number;
    triggeringFaction?: number;
}

export interface ZoneMetagameEvent {
    id: number;
    typeId: number;
    name?: string;
    description?: string;
    zoneId?: number;
    /** .NET TimeSpan, serialized as `d.hh:mm:ss`. */
    duration?: string;
}

export interface ZoneAlertState {
    timestamp: IsoDateString;
    instanceId?: number;
    metagameEventId?: number;
    metagameEvent: ZoneMetagameEvent;
}

export interface WorldOnlineZoneState {
    id: number;
    name?: string;
    isTracking: boolean;
    lockState?: ZoneLockState;
    alertState?: ZoneAlertState;
    population?: PopulationPeriod;
}

/** `GET ps2/worldState` and `GET ps2/worldState/{worldId}` */
export interface WorldOnlineState {
    id: number;
    name?: string;
    isOnline: boolean;
    onlineCharacters: number;
    zoneStates?: WorldOnlineZoneState[];
}
