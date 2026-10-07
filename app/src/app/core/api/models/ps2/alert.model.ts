import { CombatReport } from './combat-report.model';
import { IsoDateString } from './common.model';
import { ZoneRegionOwnership } from './map.model';

export interface MetagameEventCategory {
    id: number;
    name?: string;
    description?: string;
    type?: number;
    experienceBonus?: number;
}

/** An alert as listed by `GET ps2/alert/alerts/{page}`. */
export interface Alert {
    worldId: number;
    metagameInstanceId: number;
    zoneId?: number;
    metagameEventId?: number;
    startDate?: IsoDateString;
    endDate?: IsoDateString;
    startFactionVs?: number;
    startFactionNc?: number;
    startFactionTr?: number;
    startFactionNs?: number;
    lastFactionVs?: number;
    lastFactionNc?: number;
    lastFactionTr?: number;
    lastFactionNs?: number;
    metagameEvent?: MetagameEventCategory;
}

/** A single alert with its combat report, from `GET ps2/alert/{worldId}/{instanceId}`. */
export interface AlertResult {
    worldId: number;
    metagameInstanceId: number;
    zoneId?: number;
    metagameEventId?: number;
    startDate?: IsoDateString;
    endDate?: IsoDateString;
    startFactionVS: number;
    startFactionNC: number;
    startFactionTR: number;
    startFactionNS: number;
    lastFactionVS: number;
    lastFactionNC: number;
    lastFactionTR: number;
    lastFactionNS: number;
    metagameEvent?: MetagameEventCategory;
    log?: CombatReport;
    score?: number[];
    serverId?: string;
    mapId?: string;
    zoneSnapshot?: ZoneRegionOwnership[];
}
