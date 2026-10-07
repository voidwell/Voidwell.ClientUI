import { CombatReportClassStats, CombatReportOutfitStats, CombatReportParticipantStats, CombatReportVehicleStats, CombatReportWeaponStats } from './combat-report.model';
import { FactionValues, IsoDateString, PopulationPeriod } from './common.model';

/** `GET ps2/world` */
export interface World {
    id: number;
    name?: string;
}

export interface DailyPopulation {
    date: IsoDateString;
    worldId: number;
    vsCount: number;
    ncCount: number;
    trCount: number;
    nsCount: number;
    vsAvgPlayTime: number;
    ncAvgPlayTime: number;
    trAvgPlayTime: number;
    nsAvgPlayTime: number;
    avgPlayTime: number;
}

/** `GET ps2/world/population`, keyed by world id. */
export type WorldPopulationHistory = Record<number, DailyPopulation[]>;

export interface WorldActivityStats {
    kills: FactionValues;
    deaths: FactionValues;
    headshots: FactionValues;
    teamKills: FactionValues;
    suicides: FactionValues;
    vehicleKills: FactionValues;
    kdr: FactionValues;
    hsr: FactionValues;
}

export interface WorldActivityExperienceItem {
    characterId: string;
    characterName?: string;
    characterBattleRank?: number;
    characterFactionId?: number;
    characterPrestigeLevel?: number;
    characterOutfitAlias?: string;
    ticks: number;
}

export interface WorldActivityExperienceFactions {
    vs?: WorldActivityExperienceItem[];
    nc?: WorldActivityExperienceItem[];
    tr?: WorldActivityExperienceItem[];
    ns?: WorldActivityExperienceItem[];
}

export interface WorldActivityExperience {
    heals?: WorldActivityExperienceFactions;
    revives?: WorldActivityExperienceFactions;
    roadkills?: WorldActivityExperienceFactions;
    squadBeaconKills?: WorldActivityExperienceFactions;
}

/** `GET ps2/world/activity` */
export interface WorldActivity {
    activityPeriodStart: IsoDateString;
    activityPeriodEnd: IsoDateString;
    historicalPopulations?: PopulationPeriod[];
    stats?: WorldActivityStats;
    classStats?: CombatReportClassStats[];
    topVehicles?: CombatReportVehicleStats[];
    topPlayers?: CombatReportParticipantStats[];
    topOutfits?: CombatReportOutfitStats[];
    topWeapons?: CombatReportWeaponStats[];
    topExperience?: WorldActivityExperience;
}
