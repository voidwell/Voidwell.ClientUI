import { IsoDateString } from './common.model';

/** `GET ps2/outfit/{outfitId}` */
export interface OutfitDetails {
    outfitId?: string;
    name?: string;
    alias?: string;
    factionId?: number;
    factionName?: string;
    factionImageId?: number;
    worldId?: number;
    worldName?: string;
    createdDate: IsoDateString;
    leaderCharacterId?: string;
    leaderName?: string;
    memberCount: number;
    trackedMemberCount: number;
    activity7Days: number;
    activity30Days: number;
    activity90Days: number;
}

export interface OutfitMemberDetailsStats {
    weaponKills?: number;
    weaponDeaths?: number;
    weaponHeadshots?: number;
    facilityDefendedCount?: number;
    facilityCaptureCount?: number;
    assistCount?: number;
    weaponHitCount?: number;
    weaponFireCount?: number;
    weaponScore?: number;
    weaponPlayTime?: number;
    weaponVehicleKills?: number;
    dominationCount?: number;
    revengeCount?: number;
}

/** `GET ps2/outfit/{outfitId}/members` */
export interface OutfitMemberDetails {
    characterId?: string;
    name?: string;
    memberSinceDate: IsoDateString;
    rankOrdinal: number;
    rank?: string;
    battleRank?: number;
    lastLoginDate?: IsoDateString;
    lifetimeStats?: OutfitMemberDetailsStats;
}
