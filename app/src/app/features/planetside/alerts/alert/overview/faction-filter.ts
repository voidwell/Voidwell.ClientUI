import { ChipOption } from '@shared/ui/vw-chips/vw-chips.component';

/** How many rows the top cards of the overview show. */
export const TOP_ROWS = 10;

/** The faction a top card is limited to, or `null` for all of them. */
export type FactionFilter = number | null;

/** "All", then one chip for each empire. */
export const FACTION_FILTER_OPTIONS: ChipOption<FactionFilter>[] = [
    { value: null, label: 'All' },
    { value: 1, label: 'VS' },
    { value: 2, label: 'NC' },
    { value: 3, label: 'TR' }
];

/** The rows of the given faction (all of them when `faction` is `null`) ranked by `rank`, best first, then by kills. */
export function topRanked<T extends { factionId: number; kills: number }>(rows: readonly T[], faction: FactionFilter, rank: (row: T) => number, count = TOP_ROWS): T[] {
    const picked = faction === null ? [...rows] : rows.filter(row => row.factionId === faction);
    return picked.sort((a, b) => rank(b) - rank(a) || b.kills - a.kills).slice(0, count);
}
