export interface AccuracyState {
    crouching?: number;
    crouchWalking?: number;
    standing?: number;
    running?: number;
    cof?: number;
}

/** `GET ps2/weaponInfo/{weaponItemId}` */
export interface WeaponInfoResult {
    name?: string;
    itemId: number;
    category?: string;
    factionId?: number;
    factionName?: string;
    imageId?: number;
    description?: string;
    maxStackSize: number;
    range?: string;
    fireRateMs?: number;
    clipSize?: number;
    capacity?: number;
    muzzleVelocity?: number;
    minDamage?: number;
    maxDamage?: number;
    minDamageRange?: number;
    maxDamageRange?: number;
    indirectMaxDamage?: number;
    indirectMinDamage?: number;
    indirectMaxDamageRange?: number;
    indirectMinDamageRange?: number;
    minReloadSpeed?: number;
    maxReloadSpeed?: number;
    ironSightZoom?: number;
    fireModes?: string[];
    hipAcc?: AccuracyState;
    aimAcc?: AccuracyState;
    isVehicleWeapon: boolean;
    damageRadius?: number;
}

/** A row of `GET ps2/leaderboard/weapon/{weaponItemId}` */
export interface WeaponLeaderboardRow {
    characterId?: string;
    name?: string;
    factionId: number;
    worldId: number;
    kills: number;
    deaths: number;
    headshots: number;
    shotsFired: number;
    shotsHit: number;
    playTime: number;
    score: number;
    vehicleKills: number;
    kdrDelta?: number;
    accuracyDelta?: number;
    hsrDelta?: number;
    kphDelta?: number;
}

export type LeaderboardSortDirection = 'asc' | 'desc';

/** A weapon or vehicle weapon in `GET ps2/oracle/category/{categoryId}`. */
export interface SimpleItem {
    id: number;
    name?: string;
}

export interface OracleStat {
    period: string;
    value?: number;
}

/** `GET ps2/oracle/stats/{statId}`, keyed by weapon item id. */
export type OracleStatsByWeapon = Record<number, OracleStat[]>;
