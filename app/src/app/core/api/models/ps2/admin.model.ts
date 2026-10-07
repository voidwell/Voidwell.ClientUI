import { IsoDateString, Ps2Platform } from './common.model';

/** `GET ps2/psb/sessions` */
export interface CharacterLastSession {
    characterId?: string;
    name?: string;
    sessionId?: number;
    loginDate?: IsoDateString;
    logoutDate?: IsoDateString;
    duration?: number;
}

/** `GET ps2/services/status` and the enable / disable endpoints. */
export interface ServiceState {
    isEnabled: boolean;
    name?: string;
    details?: unknown;
}

/** `GET ps2/store/updatelog` and `POST ps2/store/update/{storeName}` */
export interface LastStoreUpdate {
    storeName?: string;
    lastUpdated?: IsoDateString;
    /** .NET TimeSpan, serialized as `d.hh:mm:ss`. */
    updateInterval: string;
}

/** A service state tagged with the Daybreak instance that reported it. */
export type PlatformServiceState = ServiceState & { platform: Ps2Platform };

/** A store update tagged with the Daybreak instance that reported it. */
export type PlatformStoreUpdate = LastStoreUpdate & { platform: Ps2Platform };
