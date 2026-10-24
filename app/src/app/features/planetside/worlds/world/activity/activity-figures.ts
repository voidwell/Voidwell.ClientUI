import { Sort } from '@angular/material/sort';
import { CombatReportClassStats, CombatReportOutfitStats, CombatReportParticipantStats, CombatReportVehicleStats, CombatReportWeaponStats } from '@core/api/models/ps2/combat-report.model';
import { WorldActivityStats } from '@core/api/models/ps2/world.model';
import { FactionKey } from '../../world-list-figures';

export type SortCell = string | number | null | undefined;

/**
 * Rows in the order of a sort header. A figure that can't be worked out sorts last whichever way the sort runs, text
 * sorts without regard to case, and no direction leaves the rows as they came.
 */
export function sortRows<T>(rows: readonly T[], sort: Sort, value: (row: T, column: string) => SortCell): T[] {
    if (!sort.direction) {
        return [...rows];
    }

    const sign = sort.direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
        const x = value(a, sort.active);
        const y = value(b, sort.active);
        const missingX = x === null || x === undefined || x === '';
        const missingY = y === null || y === undefined || y === '';
        if (missingX || missingY) {
            return missingX === missingY ? 0 : missingX ? 1 : -1;
        }
        if (typeof x === 'number' && typeof y === 'number') {
            return (x - y) * sign;
        }
        return String(x).localeCompare(String(y), undefined, { sensitivity: 'base' }) * sign;
    });
}

/** A row's figure for a sort header named after the row's field. */
export function cellOf<T extends object>(row: T, column: string): SortCell {
    return (row as Record<string, SortCell>)[column];
}

/** `numerator / denominator`, or `null` when there is nothing to divide by. */
export const ratio = (numerator: number, denominator: number): number | null => (denominator > 0 ? numerator / denominator : null);

/** Kills per death; `null` without deaths. */
export const kdr = (kills: number, deaths: number): number | null => ratio(kills, deaths);

/** Headshots per kill, 0 to 1; `null` without kills. */
export const hsr = (headshots: number, kills: number): number | null => ratio(headshots, kills);

const finiteOrNull = (value: number | null | undefined): number | null => (typeof value === 'number' && isFinite(value) ? value : null);

/** How a figure is written: a count, a ratio to two places, or a 0 to 1 share as a percentage. */
export type StatFormat = 'count' | 'ratio' | 'percent';

/** A row of the faction comparison. */
export interface FactionStatRow {
    label: string;
    /** The full name of an abbreviated label. */
    title?: string;
    format: StatFormat;
    values: Record<FactionKey, number | null>;
    /** The one of VS, NC and TR ahead on a figure where more is better; `null` for a tie or when there is nothing to compare. */
    leader: FactionKey | null;
}

const STAT_ROWS: { key: keyof WorldActivityStats; label: string; title?: string; format: StatFormat; moreIsBetter: boolean }[] = [
    { key: 'kills', label: 'Kills', format: 'count', moreIsBetter: true },
    { key: 'deaths', label: 'Deaths', format: 'count', moreIsBetter: false },
    { key: 'kdr', label: 'K/D', title: 'Kill/death ratio', format: 'ratio', moreIsBetter: true },
    { key: 'hsr', label: 'HSR', title: 'Headshot ratio', format: 'percent', moreIsBetter: true },
    { key: 'vehicleKills', label: 'Vehicle kills', format: 'count', moreIsBetter: true },
    { key: 'teamKills', label: 'TKs', title: 'Team kills', format: 'count', moreIsBetter: false },
    { key: 'suicides', label: 'Suicides', format: 'count', moreIsBetter: false },
    { key: 'headshots', label: 'Headshots', format: 'count', moreIsBetter: true }
];

/** NS players don't pick a faction, so they aren't compared with the other three. */
const COMPARED: FactionKey[] = ['vs', 'nc', 'tr'];

export function factionStatRows(stats: WorldActivityStats | undefined): FactionStatRow[] {
    if (!stats) {
        return [];
    }

    return STAT_ROWS.map(row => {
        const source = stats[row.key];
        const values = { vs: finiteOrNull(source?.vs), nc: finiteOrNull(source?.nc), tr: finiteOrNull(source?.tr), ns: finiteOrNull(source?.ns) };

        const best = Math.max(...COMPARED.map(key => values[key] ?? -Infinity));
        const leaders = COMPARED.filter(key => values[key] === best);
        return {
            label: row.label,
            title: row.title,
            format: row.format,
            values,
            leader: row.moreIsBetter && best > 0 && leaders.length === 1 ? leaders[0] : null
        };
    });
}

/** The whole minutes of a span as "1h 5m" or "58m"; `null` for a missing span. */
export function formatTimespan(milliseconds: number | null): string | null {
    if (milliseconds === null || milliseconds <= 0) {
        return null;
    }

    const hours = Math.floor(milliseconds / 36e5);
    const minutes = Math.floor((milliseconds % 36e5) / 60000);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

/** A top player with the figures the table shows. */
export interface TopPlayerRow {
    id: string;
    name: string;
    factionId: number;
    alias?: string;
    battleRank?: number;
    prestigeLevel: number;
    className?: string;
    kills: number;
    deaths: number;
    kdr: number | null;
    hsr: number | null;
    kpm: number | null;
    sessionKills: number;
    sessionKpm: number | null;
    teamkills: number;
    suicides: number;
    vehicleKills: number;
    topWeaponName?: string;
    sessionMinutes: number | null;
    playTime: string | null;
}

export function topPlayerRows(players: CombatReportParticipantStats[] | undefined, periodMinutes: number, now = new Date()): TopPlayerRow[] {
    return (players ?? [])
        .filter(player => player.character?.id)
        .map(player => {
            const login = player.loginDate ? new Date(player.loginDate) : null;
            const logout = player.logoutDate ? new Date(player.logoutDate) : now;
            const sessionMs = login ? logout.getTime() - login.getTime() : null;
            const sessionMinutes = sessionMs && sessionMs > 0 ? sessionMs / 60000 : null;

            return {
                id: player.character.id,
                name: player.character.name ?? 'Unknown',
                factionId: player.character.factionId ?? 0,
                alias: player.outfit?.alias || undefined,
                battleRank: player.character.battleRank,
                prestigeLevel: player.character.prestigeLevel ?? 0,
                className: player.topProfileName,
                kills: player.kills,
                deaths: player.deaths,
                kdr: kdr(player.kills, player.deaths),
                hsr: hsr(player.headshots, player.kills),
                kpm: periodMinutes > 0 ? player.kills / periodMinutes : null,
                sessionKills: player.sessionKills,
                sessionKpm: player.sessionKills > 0 && sessionMinutes ? player.sessionKills / sessionMinutes : null,
                teamkills: player.teamkills,
                suicides: player.suicides,
                vehicleKills: player.vehicleKills,
                topWeaponName: player.topWeaponName,
                sessionMinutes,
                playTime: formatTimespan(sessionMs)
            };
        });
}

/** A top outfit with the figures the table shows. */
export interface TopOutfitRow {
    id: string;
    name: string;
    factionId: number;
    alias?: string;
    kills: number;
    deaths: number;
    kdr: number | null;
    killsPerMember: number | null;
    deathsPerMember: number | null;
    hsr: number | null;
    members: number;
    captures: number;
    teamkills: number;
    suicides: number;
    vehicleKills: number;
}

export function topOutfitRows(outfits: CombatReportOutfitStats[] | undefined): TopOutfitRow[] {
    return (outfits ?? [])
        .filter(stats => stats.outfit?.id)
        .map(stats => ({
            id: stats.outfit.id,
            name: stats.outfit.name ?? 'Unknown',
            factionId: stats.outfit.factionId ?? 0,
            alias: stats.outfit.alias || undefined,
            kills: stats.kills,
            deaths: stats.deaths,
            kdr: kdr(stats.kills, stats.deaths),
            killsPerMember: ratio(stats.kills, stats.participantCount),
            deathsPerMember: ratio(stats.deaths, stats.participantCount),
            hsr: hsr(stats.headshots, stats.kills),
            members: stats.participantCount,
            captures: stats.facilityCaptures,
            teamkills: stats.teamkills,
            suicides: stats.suicides,
            vehicleKills: stats.vehicleKills
        }));
}

/** A class with the figures the table shows. */
export interface ClassRow {
    name: string;
    factionId: number;
    kills: number;
    deaths: number;
    kdr: number | null;
    hsr: number | null;
    teamkills: number;
    suicides: number;
    vehicleKills: number;
}

export function classRows(classes: CombatReportClassStats[] | undefined): ClassRow[] {
    return (classes ?? [])
        .filter(stats => stats.profile)
        .map(stats => ({
            name: stats.profile.name ?? 'Unknown',
            factionId: stats.profile.factionId ?? 0,
            kills: stats.kills,
            deaths: stats.deaths,
            kdr: kdr(stats.kills, stats.deaths),
            hsr: hsr(stats.headshots, stats.kills),
            teamkills: stats.teamkills,
            suicides: stats.suicides,
            vehicleKills: stats.vehicleKills
        }));
}

/** A weapon with the figures the table shows. */
export interface WeaponRow {
    id?: string;
    name: string;
    factionId: number;
    kills: number;
    headshots: number;
    hsr: number | null;
    teamkills: number;
}

export function weaponRows(weapons: CombatReportWeaponStats[] | undefined): WeaponRow[] {
    return (weapons ?? []).map(stats => ({
        id: stats.item?.id,
        name: stats.item?.name || 'Unknown',
        factionId: stats.item?.factionId ?? 0,
        kills: stats.kills,
        headshots: stats.headshots,
        hsr: hsr(stats.headshots, stats.kills),
        teamkills: stats.teamkills
    }));
}

/** A vehicle with the figures the table shows. */
export interface VehicleRow {
    name: string;
    factionId: number;
    kills: number;
    deaths: number;
    kdr: number | null;
    teamkills: number;
}

export function vehicleRows(vehicles: CombatReportVehicleStats[] | undefined): VehicleRow[] {
    return (vehicles ?? []).map(stats => ({
        name: stats.vehicle?.name || 'Unknown',
        factionId: stats.vehicle?.factionId ?? 0,
        kills: stats.kills,
        deaths: stats.deaths,
        kdr: kdr(stats.kills, stats.deaths),
        teamkills: stats.teamkills
    }));
}
