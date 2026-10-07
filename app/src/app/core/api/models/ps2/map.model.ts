import { IsoDateString } from './common.model';

export interface ZoneRegionOwnership {
    regionId: number;
    factionId: number;
}

export interface ZoneRegion {
    regionId: number;
    facilityId?: number;
    facilityName?: string;
    facilityType?: string;
    facilityTypeId?: number;
    x?: number;
    y?: number;
    z?: number;
}

export interface ZoneLink {
    facilityIdA: number;
    facilityIdB: number;
}

export interface ZoneHex {
    mapRegionId: number;
    x: number;
    y: number;
    hexType: number;
}

/** `GET ps2/map/{zoneId}` */
export interface ZoneMap {
    regions?: ZoneRegion[];
    links?: ZoneLink[];
    hexs?: ZoneHex[];
    hexSize?: number;
}

export interface OwnershipScoreBreakdown {
    value: number;
    percent: number;
}

export interface OwnershipScoreFactions {
    vs: OwnershipScoreBreakdown;
    nc: OwnershipScoreBreakdown;
    tr: OwnershipScoreBreakdown;
    ns: OwnershipScoreBreakdown;
    neutural: OwnershipScoreBreakdown;
}

export interface MapScore {
    territories?: OwnershipScoreFactions;
    connectedTerritories?: OwnershipScoreFactions;
    ampStations?: OwnershipScoreFactions;
    techPlants?: OwnershipScoreFactions;
    bioLabs?: OwnershipScoreFactions;
    largeOutposts?: OwnershipScoreFactions;
    smallOutposts?: OwnershipScoreFactions;
}

export interface SnapshotRequest {
    zoneId: number;
    worldId: number;
    timestamp?: IsoDateString;
}

export interface ZoneSnapshot {
    timestamp: IsoDateString;
    worldId: number;
    zoneId: number;
    metagameInstanceId?: number;
    ownership?: ZoneRegionOwnership[];
}
