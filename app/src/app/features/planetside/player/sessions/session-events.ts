import { CombatReportItemDetail } from '@core/api/models/ps2/combat-report.model';
import { PlayerSessionEvent, PlayerSessionWeapon } from '@core/api/models/ps2/character.model';

/** What an event was to the player whose session it is. */
export type SessionEventKind =
    | 'kill' | 'teamkill' | 'suicide' | 'death'
    | 'vehicleKill' | 'vehicleLoss'
    | 'capture' | 'defend' | 'rankUp' | 'login' | 'logout';

/** The groups the event log can be filtered by. */
export type SessionEventFilter = 'all' | 'combat' | 'vehicles' | 'facilities';

/** A session event from the player's point of view. */
export interface SessionLogEntry {
    event: PlayerSessionEvent;
    kind: SessionEventKind;
    /** The other character involved, if any: whom the player killed, or who killed them. */
    other?: CombatReportItemDetail;
    weapon?: PlayerSessionWeapon;
    headshot: boolean;
}

export interface SessionStats {
    kills: number;
    /** Deaths, suicides included as the game counts them. */
    deaths: number;
    headshots: number;
    teamkills: number;
    suicides: number;
    vehicleKills: number;
    vehiclesLost: number;
    facilitiesCaptured: number;
    facilitiesDefended: number;
    /** Kills per death; the kills when there were no deaths. */
    kdr: number;
    /** Share of kills that were headshots, 0–100. */
    headshotRatio: number;
}

export interface WeaponUsage {
    weapon: PlayerSessionWeapon;
    kills: number;
    headshots: number;
}

/** One column of the activity chart: kills and deaths in a slice of the session. */
export interface ActivityBucket {
    start: number;
    kills: number;
    deaths: number;
}

const FILTER_KINDS: Record<Exclude<SessionEventFilter, 'all'>, SessionEventKind[]> = {
    combat: ['kill', 'teamkill', 'suicide', 'death'],
    vehicles: ['vehicleKill', 'vehicleLoss'],
    facilities: ['capture', 'defend']
};

/** Classifies an event from the point of view of the character `playerId`. */
export function toLogEntry(event: PlayerSessionEvent, playerId: string): SessionLogEntry {
    switch (event.eventType) {
        case 'Death': {
            const byPlayer = event.attacker?.id === playerId;
            const ofPlayer = event.victim?.id === playerId;
            const kind: SessionEventKind = byPlayer && ofPlayer ? 'suicide'
                : ofPlayer ? 'death'
                : event.attacker?.factionId === event.victim?.factionId ? 'teamkill'
                : 'kill';
            return { event, kind, other: byPlayer ? event.victim : event.attacker, weapon: event.weapon, headshot: event.isHeadshot };
        }
        case 'VehicleDestroy': {
            // The player's own vehicle is a loss even when they destroyed it themselves
            const ofPlayer = event.victim?.id === playerId;
            return {
                event,
                kind: ofPlayer ? 'vehicleLoss' : 'vehicleKill',
                other: ofPlayer ? event.attacker : event.victim,
                weapon: event.weapon,
                headshot: false
            };
        }
        case 'FacilityCapture':
            return { event, kind: 'capture', headshot: false };
        case 'FacilityDefend':
            return { event, kind: 'defend', headshot: false };
        case 'BattleRankUp':
            return { event, kind: 'rankUp', headshot: false };
        case 'Login':
            return { event, kind: 'login', headshot: false };
        case 'Logout':
            return { event, kind: 'logout', headshot: false };
    }
}

export function matchesFilter(entry: SessionLogEntry, filter: SessionEventFilter): boolean {
    return filter === 'all' || FILTER_KINDS[filter].includes(entry.kind);
}

export function sessionStats(entries: SessionLogEntry[]): SessionStats {
    const count = (kind: SessionEventKind) => entries.filter(entry => entry.kind === kind).length;
    const kills = count('kill');
    const deaths = count('death') + count('suicide');
    const headshots = entries.filter(entry => entry.kind === 'kill' && entry.headshot).length;

    return {
        kills,
        deaths,
        headshots,
        teamkills: count('teamkill'),
        suicides: count('suicide'),
        vehicleKills: count('vehicleKill'),
        vehiclesLost: count('vehicleLoss'),
        facilitiesCaptured: count('capture'),
        facilitiesDefended: count('defend'),
        kdr: deaths > 0 ? kills / deaths : kills,
        headshotRatio: kills > 0 ? headshots / kills * 100 : 0
    };
}

/**
 * The weapons the player killed enemies with, most kills first. Variants of a weapon with the same name (separate
 * items in the game) are counted together.
 */
export function weaponUsage(entries: SessionLogEntry[]): WeaponUsage[] {
    const byWeapon = new Map<string, WeaponUsage>();
    for (const entry of entries) {
        if (entry.kind !== 'kill' || !entry.weapon) {
            continue;
        }
        const key = entry.weapon.name || `#${entry.weapon.id}`;
        const usage = byWeapon.get(key) ?? { weapon: entry.weapon, kills: 0, headshots: 0 };
        usage.kills++;
        usage.headshots += entry.headshot ? 1 : 0;
        byWeapon.set(key, usage);
    }
    return [...byWeapon.values()].sort((a, b) => b.kills - a.kills);
}

/** Kills and deaths in `count` equal slices of the session, from `start` to `end` (epoch milliseconds). */
export function activityBuckets(entries: SessionLogEntry[], start: number, end: number, count: number): ActivityBucket[] {
    const span = Math.max(1, end - start);
    const buckets: ActivityBucket[] = Array.from({ length: count }, (_, i) => ({ start: start + span * i / count, kills: 0, deaths: 0 }));

    for (const entry of entries) {
        if (entry.kind !== 'kill' && entry.kind !== 'death') {
            continue;
        }
        const time = Date.parse(entry.event.timestamp);
        const index = Math.min(count - 1, Math.max(0, Math.floor((time - start) / span * count)));
        buckets[index][entry.kind === 'kill' ? 'kills' : 'deaths']++;
    }
    return buckets;
}

/** The continents the session took place on, in the order the player first reached them. */
export function zonesVisited(events: PlayerSessionEvent[]): number[] {
    return [...new Set(events.map(event => event.zoneId).filter((zoneId): zoneId is number => !!zoneId))];
}

/** A duration as hours and minutes, e.g. `2h 21m` or `53m`. */
export function formatDuration(milliseconds: number): string {
    const minutes = Math.max(0, Math.round(milliseconds / 60000));
    const hours = Math.floor(minutes / 60);
    return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}
