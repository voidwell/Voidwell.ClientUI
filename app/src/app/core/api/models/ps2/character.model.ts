import { CombatReportItemDetail } from './combat-report.model';
import { IsoDateString } from './common.model';

export interface InfantryStats {
    weapons?: number;
    unsanctionedWeapons?: number;
    kills?: number;
    accuracy?: number;
    headshotRatio?: number;
    killDeathRatio?: number;
    killsPerMinute?: number;
    kdrPadding?: number;
    accuracyDelta?: number;
    headshotRatioDelta?: number;
    killsPerMinuteDelta?: number;
    killDeathRatioDelta?: number;
    iviScore?: number;
}

export interface CharacterDetailsTimes {
    createdDate: IsoDateString;
    lastSaveDate: IsoDateString;
    lastLoginDate: IsoDateString;
    minutesPlayed: number;
}

export interface CharacterDetailsOutfit {
    id?: string;
    memberSinceDate: IsoDateString;
    rank?: string;
    name?: string;
    alias?: string;
    createdDate: IsoDateString;
    memberCount: number;
}

export interface CharacterDetailsStatsHistory {
    statName?: string;
    allTime: number;
    oneLifeMax: number;
    day?: number[];
    month?: number[];
    week?: number[];
}

export interface CharacterDetailsLifetimeStats {
    achievementCount: number;
    assistCount: number;
    facilityDefendedCount: number;
    medalCount: number;
    skillPoints: number;
    deaths: number;
    fireCount: number;
    hitCount: number;
    playTime: number;
    score: number;
    dominationCount: number;
    facilityCaptureCount: number;
    revengeCount: number;
    damageGiven: number;
    damageTakenBy: number;
    headshots: number;
    killedBy?: number;
    kills?: number;
    vehicleKills: number;
}

export interface CharacterDetailsProfileStat {
    profileId: number;
    profileName?: string;
    imageId?: number;
    deaths: number;
    fireCount: number;
    hitCount: number;
    playTime: number;
    score: number;
    killedBy: number;
    kills: number;
}

export interface CharacterDetailsProfileStatByFactionValue {
    vs: number;
    nc: number;
    tr: number;
}

export interface CharacterDetailsProfileStatByFaction {
    profileId: number;
    profileName?: string;
    imageId?: number;
    killedBy?: CharacterDetailsProfileStatByFactionValue;
    kills?: CharacterDetailsProfileStatByFactionValue;
}

export interface CharacterDetailsWeaponStatValue {
    deaths?: number;
    fireCount?: number;
    hitCount?: number;
    playTime?: number;
    damageGiven?: number;
    headshots?: number;
    kills?: number;
    vehicleKills?: number;
    score?: number;
    damageTakenBy?: number;
    killedBy?: number;
    killDeathRatio?: number;
    accuracy?: number;
    headshotRatio?: number;
    killsPerHour?: number;
    vehicleKillsPerHour?: number;
    scorePerMinute?: number;
    landedPerKill?: number;
    shotsPerKill?: number;
    killDeathRatioDelta?: number;
    accuracyDelta?: number;
    hsrDelta?: number;
    kphDelta?: number;
    vehicleKphDelta?: number;
}

export interface CharacterDetailsWeaponStat {
    itemId: number;
    category?: string;
    imageId?: number;
    name?: string;
    vehicleId?: number;
    vehicleName?: string;
    vehicleImageId?: number;
    stats?: CharacterDetailsWeaponStatValue;
}

export interface CharacterDetailsVehicleStat {
    vehicleId: number;
    damageTakenBy?: number;
    killedBy?: number;
    score?: number;
    deaths?: number;
    fireCount?: number;
    hitCount?: number;
    playTime?: number;
    damageGiven?: number;
    headshots?: number;
    kills?: number;
    vehicleKills?: number;
    pilotKills?: number;
    pilotDeaths?: number;
    pilotVehicleKills?: number;
    pilotPlayTime?: number;
    pilotDamageGiven?: number;
    pilotDamageTakenBy?: number;
    pilotScore?: number;
    pilotKilledBy?: number;
    pilotFireCount?: number;
    pilotHitCount?: number;
    pilotHeadshots?: number;
}

/** `GET ps2/character/{characterId}` */
export interface CharacterDetails {
    id?: string;
    name?: string;
    battleRank: number;
    battleRankPercentToNext: number;
    certsEarned: number;
    faction?: string;
    factionId: number;
    factionImageId?: number;
    title?: string;
    world?: string;
    worldId: number;
    prestigeLevel: number;
    times?: CharacterDetailsTimes;
    outfit?: CharacterDetailsOutfit;
    lifetimeStats?: CharacterDetailsLifetimeStats;
    profileStats?: CharacterDetailsProfileStat[];
    profileStatsByFaction?: CharacterDetailsProfileStatByFaction[];
    weaponStats?: CharacterDetailsWeaponStat[];
    vehicleStats?: CharacterDetailsVehicleStat[];
    infantryStats?: InfantryStats;
    statsHistory?: CharacterDetailsStatsHistory[];
}

/** `GET ps2/character/byname/{name}` and the entries of `POST ps2/character/byname`. */
export interface SimpleCharacterDetails {
    id?: string;
    name?: string;
    world?: string;
    factionId: number;
    factionName?: string;
    factionImageId?: number;
    battleRank: number;
    outfitAlias?: string;
    outfitName?: string;
    kills: number;
    deaths: number;
    playTime: number;
    totalPlayTimeMinutes: number;
    score: number;
    killDeathRatio: number;
    headshotRatio: number;
    killsPerHour: number;
}

/** `GET ps2/character/byname/{name}/weapon/{weapon}` */
export interface CharacterWeaponDetails {
    characterId?: string;
    characterName?: string;
    itemId: number;
    weaponName?: string;
    weaponImageId?: number;
    kills?: number;
    deaths?: number;
    playTime?: number;
    score?: number;
    headshots?: number;
    killDeathRatio?: number;
    headshotRatio?: number;
    killsPerHour?: number;
    accuracy?: number;
    killDeathRatioGrade?: string;
    headshotRatioGrade?: string;
    killsPerHourGrade?: string;
    accuracyGrade?: string;
}

export interface DirectivesOutlineReward {
    id: number;
    name?: string;
    imageId?: number;
}

export interface DirectivesOutlineObjective {
    id: number;
    typeId: number;
    goalValue?: number;
}

export interface CharacterDirectivesOutlineDirective {
    id: number;
    treeId: number;
    tierId: number;
    name?: string;
    description?: string;
    imageId?: number;
    completionDate?: IsoDateString;
    progress: number;
    objective: DirectivesOutlineObjective;
}

export interface CharacterDirectivesOutlineTier {
    tierId: number;
    treeId: number;
    directivePoints?: number;
    completionCount: number;
    name?: string;
    imageId?: number;
    completionDate?: IsoDateString;
    completionPercent: number;
    rewards: DirectivesOutlineReward[];
    directives: CharacterDirectivesOutlineDirective[];
}

export interface CharacterDirectivesOutlineTree {
    id: number;
    name?: string;
    description?: string;
    imageId?: number;
    currentDirectiveTierId: number;
    currentLevel: number;
    completionDate?: IsoDateString;
    tiers: CharacterDirectivesOutlineTier[];
}

export interface CharacterDirectivesOutlineCategory {
    id: number;
    name?: string;
    trees: CharacterDirectivesOutlineTree[];
}

/** `GET ps2/character/{characterId}/directives` */
export interface CharacterDirectivesOutline {
    categories: CharacterDirectivesOutlineCategory[];
}

/** A session row of `GET ps2/character/{characterId}/sessions`. */
export interface PlayerSessionSummary {
    id: number;
    characterId?: string;
    loginDate: IsoDateString;
    logoutDate: IsoDateString;
    duration: number;
}

export type PlayerSessionEventType =
    'Death' | 'FacilityCapture' | 'FacilityDefend' | 'BattleRankUp' | 'VehicleDestroy' | 'Login' | 'Logout';

export interface PlayerSessionWeapon {
    id: number;
    imageId?: number;
    name?: string;
}

export interface PlayerSessionVehicle {
    id: number;
    imageId?: number;
    name?: string;
}

export interface PlayerSessionFacility {
    id: number;
    name?: string;
    typeId?: number;
    typeName?: string;
}

interface PlayerSessionEventBase {
    timestamp: IsoDateString;
    zoneId?: number;
}

export interface PlayerSessionLoginEvent extends PlayerSessionEventBase {
    eventType: 'Login';
}

export interface PlayerSessionLogoutEvent extends PlayerSessionEventBase {
    eventType: 'Logout';
}

export interface PlayerSessionDeathEvent extends PlayerSessionEventBase {
    eventType: 'Death';
    attacker?: CombatReportItemDetail;
    victim?: CombatReportItemDetail;
    weapon?: PlayerSessionWeapon;
    attackerFireModeId?: number;
    attackerLoadoutId?: number;
    attackerOutfitId?: string;
    attackerVehicleId?: number;
    characterLoadoutId?: number;
    characterOutfitId?: string;
    isHeadshot: boolean;
}

export interface PlayerSessionFacilityCaptureEvent extends PlayerSessionEventBase {
    eventType: 'FacilityCapture';
    facility?: PlayerSessionFacility;
}

export interface PlayerSessionFacilityDefendEvent extends PlayerSessionEventBase {
    eventType: 'FacilityDefend';
    facility?: PlayerSessionFacility;
}

export interface PlayerSessionBattleRankUpEvent extends PlayerSessionEventBase {
    eventType: 'BattleRankUp';
    battleRank: number;
}

export interface PlayerSessionVehicleDestroyEvent extends PlayerSessionEventBase {
    eventType: 'VehicleDestroy';
    attacker?: CombatReportItemDetail;
    victim?: CombatReportItemDetail;
    weapon?: PlayerSessionWeapon;
    victimVehicle?: PlayerSessionVehicle;
    facility?: PlayerSessionFacility;
    attackerLoadoutId?: number;
    attackerVehicleId?: number;
    factionId?: number;
}

/** Session events, discriminated by `eventType`. */
export type PlayerSessionEvent =
    | PlayerSessionLoginEvent
    | PlayerSessionLogoutEvent
    | PlayerSessionDeathEvent
    | PlayerSessionFacilityCaptureEvent
    | PlayerSessionFacilityDefendEvent
    | PlayerSessionBattleRankUpEvent
    | PlayerSessionVehicleDestroyEvent;

export interface PlayerSessionInfo {
    characterId?: string;
    duration: number;
    id?: string;
    loginDate: IsoDateString;
    logoutDate?: IsoDateString;
}

/** A single session with its event log. */
export interface PlayerSession {
    events?: PlayerSessionEvent[];
    session?: PlayerSessionInfo;
}

export interface OnlineCharacterProfile {
    characterId?: string;
    factionId: number;
    name?: string;
    worldId: number;
}

export interface OnlineCharacterLastSeen {
    timestamp: IsoDateString;
    zoneId: number;
}

/** `GET ps2/character/{characterId}/state` and the entries of `GET ps2/worldState/{worldId}/players`. */
export interface OnlineCharacter {
    character?: OnlineCharacterProfile;
    lastSeen?: OnlineCharacterLastSeen;
    loginDate: IsoDateString;
}
