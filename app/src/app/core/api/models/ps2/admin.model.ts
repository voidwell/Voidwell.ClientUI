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
    /** True when appsettings or an environment variable sets the service's state, so it can't be changed at runtime. */
    isLocked?: boolean;
    /** The source that sets a locked service's state, such as `appsettings.json` or `environment variables`. */
    lockedBy?: string | null;
    details?: unknown;
}

/** The body of the `409 Conflict` returned when enabling or disabling a locked service. */
export interface ServiceLockedError {
    message: string;
    lockedBy?: string | null;
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
