import { OnlineCharacter } from '@core/api/models/ps2/character.model';

/** The players list's rows per page. */
export const PLAYERS_PAGE_SIZE = 25;

/** A faction filter: a faction id, or 0 for everyone. */
export const ALL_FACTIONS = 0;

/** An online player as the list shows them. */
export interface OnlinePlayerRow {
    id?: string;
    name: string;
    factionId: number;
    zoneName: string | null;
    /** When the player logged in, as sent; empty when unknown. */
    loginDate: string;
    /** Whole minutes since the login, for sorting; `null` when the login is unknown. */
    onlineMinutes: number | null;
}

export function onlinePlayerRows(players: OnlineCharacter[], zoneName: (zoneId: number) => string | undefined, now = Date.now()): OnlinePlayerRow[] {
    return players
        .filter(player => player.character)
        .map(player => {
            const login = player.loginDate ? Date.parse(player.loginDate) : NaN;
            const zoneId = player.lastSeen?.zoneId;

            return {
                id: player.character.characterId,
                name: player.character.name ?? 'Unknown',
                factionId: player.character.factionId,
                zoneName: zoneId ? zoneName(zoneId) ?? null : null,
                loginDate: isNaN(login) ? '' : player.loginDate,
                onlineMinutes: isNaN(login) ? null : Math.max(0, Math.floor((now - login) / 60000))
            };
        });
}

/** The players of one faction (or all) whose name contains the search, without regard to case. */
export function filterPlayers(rows: OnlinePlayerRow[], factionId: number, search: string): OnlinePlayerRow[] {
    const term = search.trim().toLowerCase();
    return rows.filter(row => (factionId === ALL_FACTIONS || row.factionId === factionId) && (!term || row.name.toLowerCase().includes(term)));
}

/** Players per faction id, with everyone under `ALL_FACTIONS`. */
export function playerCounts(rows: OnlinePlayerRow[]): Record<number, number> {
    const counts: Record<number, number> = { [ALL_FACTIONS]: rows.length, 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const row of rows) {
        counts[row.factionId] = (counts[row.factionId] ?? 0) + 1;
    }
    return counts;
}
