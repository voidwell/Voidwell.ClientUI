import { IsoDateString } from './common.model';

export interface CombatReportRequest {
    worldId: number;
    zoneId: number;
    startDate: IsoDateString;
    endDate: IsoDateString;
}

export interface CombatReportItemDetail {
    id?: string;
    name?: string;
    factionId?: number;
}

export interface CombatReportCharacterDetail extends CombatReportItemDetail {
    battleRank?: number;
    prestigeLevel?: number;
    worldId?: number;
}

export interface CombatReportOutfitDetail extends CombatReportItemDetail {
    alias?: string;
}

export interface CombatReportClassDetail extends CombatReportItemDetail {
    profileId?: number;
    profileTypeId?: number;
    profileImageId?: number;
}

export interface CombatReportParticipantStats {
    character?: CombatReportCharacterDetail;
    outfit?: CombatReportOutfitDetail;
    kills: number;
    deaths: number;
    headshots: number;
    suicides: number;
    teamkills: number;
    vehicleKills: number;
    topWeaponId?: number;
    topWeaponName?: string;
    topProfileId?: number;
    topProfileName?: string;
    topProfileImageId?: number;
    loginDate?: IsoDateString;
    logoutDate?: IsoDateString;
    sessionKills: number;
}

export interface CombatReportOutfitStats {
    outfit?: CombatReportOutfitDetail;
    kills: number;
    deaths: number;
    headshots: number;
    suicides: number;
    teamkills: number;
    vehicleKills: number;
    participantCount: number;
    facilityCaptures: number;
}

export interface CombatReportClassStats {
    profile?: CombatReportClassDetail;
    kills: number;
    deaths: number;
    headshots: number;
    suicides: number;
    teamkills: number;
    vehicleKills: number;
}

export interface CombatReportWeaponStats {
    item?: CombatReportItemDetail;
    kills: number;
    teamkills: number;
    headshots: number;
}

export interface CombatReportVehicleStats {
    vehicle?: CombatReportItemDetail;
    kills: number;
    deaths: number;
    teamkills: number;
}

export interface CombatReportStats {
    participants?: CombatReportParticipantStats[];
    outfits?: CombatReportOutfitStats[];
    weapons?: CombatReportWeaponStats[];
    vehicles?: CombatReportVehicleStats[];
    classes?: CombatReportClassStats[];
}

export interface CaptureLogRowOutfit {
    id?: string;
    name?: string;
    alias?: string;
}

export interface CaptureLogRowMapRegion {
    id?: number;
    facilityName?: string;
    facilityType?: string;
}

export interface CaptureLogRow {
    factionVs?: number;
    factionNc?: number;
    factionTr?: number;
    factionNs?: number;
    zonePopVs?: number;
    zonePopNc?: number;
    zonePopTr?: number;
    zonePopNs?: number;
    newFactionId?: number;
    oldFactionId?: number;
    timestamp: IsoDateString;
    outfit?: CaptureLogRowOutfit;
    mapRegion?: CaptureLogRowMapRegion;
}

export interface CombatReport {
    stats?: CombatReportStats;
    captureLog?: CaptureLogRow[];
}
