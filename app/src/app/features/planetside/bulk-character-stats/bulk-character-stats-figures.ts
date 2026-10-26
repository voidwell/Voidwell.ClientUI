import { SimpleCharacterDetails } from '@core/api/models/ps2/character.model';
import { kdr } from '../components/combat-report/combat-report-figures';

/** The most names the API looks up in one request. */
export const MAX_NAMES = 25;

/** A character as the table shows it. A figure that can't be worked out is `null`. */
export interface BulkRow {
    id: string;
    name: string;
    alias: string;
    factionId: number;
    world: string;
    battleRank: number;
    hours: number;
    kills: number;
    kdr: number | null;
    /** Headshot ratio, 0 to 1. */
    hsr: number | null;
    kph: number | null;
}

const isNumber = (value: number | null | undefined): value is number => typeof value === 'number' && isFinite(value);

export function bulkRows(characters: SimpleCharacterDetails[]): BulkRow[] {
    return characters.map(character => ({
        id: character.id ?? '',
        name: character.name ?? '',
        alias: character.outfitAlias ?? '',
        factionId: character.factionId,
        world: character.world ?? '',
        battleRank: character.battleRank,
        hours: (character.totalPlayTimeMinutes || 0) / 60,
        kills: character.kills || 0,
        kdr: character.deaths > 0 ? kdr(character.kills, character.deaths) : null,
        hsr: character.kills > 0 && isNumber(character.headshotRatio) ? character.headshotRatio : null,
        kph: character.totalPlayTimeMinutes > 0 && isNumber(character.killsPerHour) ? character.killsPerHour : null
    }));
}

/** Names added to a list: split at commas, trimmed, skipping blanks, names already there (case aside) and any past the limit. */
export function addNames(current: string[], input: string, max = MAX_NAMES): string[] {
    const names = [...current];
    for (const part of input.split(',')) {
        const name = part.trim();
        if (name && names.length < max && !names.some(existing => existing.toLowerCase() === name.toLowerCase())) {
            names.push(name);
        }
    }
    return names;
}

/** The names asked for that no character came back for. */
export function missingNames(requested: string[], found: SimpleCharacterDetails[]): string[] {
    const have = new Set(found.map(character => (character.name ?? '').toLowerCase()));
    return requested.filter(name => !have.has(name.toLowerCase()));
}

/** Every field the API returned for the characters, as CSV text: a header row of all the fields, then a row each. */
export function toCsv(characters: SimpleCharacterDetails[]): string {
    const columns: string[] = [];
    for (const character of characters) {
        for (const key of Object.keys(character)) {
            if (!columns.includes(key)) {
                columns.push(key);
            }
        }
    }

    const cell = (value: unknown): string => {
        const text = value === null || value === undefined ? '' : String(value);
        return /["\n,]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
    };
    const lines = [columns.map(cell).join(',')];
    for (const character of characters) {
        lines.push(columns.map(column => cell((character as unknown as Record<string, unknown>)[column])).join(','));
    }
    return lines.join('\n') + '\n';
}
