import { RatingCharacter } from '@core/api/models/ps2/reference.model';
import { World } from '@core/api/models/ps2/world.model';

/** The players table's rows per page. */
export const PLAYER_RANKS_PAGE_SIZE = 50;

/** A rated player as the table shows it. A figure that is not known is `null`. */
export interface PlayerRankRow {
    /** The place by rating, 1 for the highest; it stays with the player however the table is sorted. */
    rank: number;
    id: string;
    name: string;
    factionId: number;
    world: string | null;
    battleRank: number | null;
    rating: number;
    deviation: number | null;
}

const isNumber = (value: number | null | undefined): value is number => typeof value === 'number' && isFinite(value);

/** The rated players ranked by rating, high to low; players with the same rating keep the order they came in. */
export function playerRankRows(players: readonly RatingCharacter[], worlds: readonly World[] | null): PlayerRankRow[] {
    const worldNames = new Map((worlds ?? []).map(world => [world.id, world.name ?? null]));

    return players
        .filter(player => isNumber(player.rating))
        .map((player, index) => ({ player, index }))
        .sort((a, b) => b.player.rating - a.player.rating || a.index - b.index)
        .map(({ player }, index): PlayerRankRow => ({
            rank: index + 1,
            id: player.characterId ?? '',
            name: player.name ?? '',
            factionId: player.factionId ?? 0,
            world: (player.worldId ? worldNames.get(player.worldId) : null) ?? null,
            battleRank: isNumber(player.battleRank) ? player.battleRank : null,
            rating: player.rating,
            deviation: isNumber(player.deviation) ? player.deviation : null
        }));
}
