import { SimpleCharacterDetails } from '@core/api/models/ps2/character.model';
import { MAX_NAMES, addNames, bulkRows, missingNames, toCsv } from './bulk-character-stats-figures';

const character = (overrides: Partial<SimpleCharacterDetails> = {}): SimpleCharacterDetails => ({
    id: '1', name: 'Wakeful', world: 'Osprey', factionId: 1, battleRank: 100, outfitAlias: 'VOID',
    kills: 200, deaths: 100, playTime: 0, totalPlayTimeMinutes: 120, score: 0, killDeathRatio: 2, headshotRatio: 0.25, killsPerHour: 100,
    ...overrides
});

describe('bulkRows', () => {
    it('turns a character into the figures the table shows', () => {
        expect(bulkRows([character()])).toEqual([
            { id: '1', name: 'Wakeful', alias: 'VOID', factionId: 1, world: 'Osprey', battleRank: 100, hours: 2, kills: 200, kdr: 2, hsr: 0.25, kph: 100 }
        ]);
    });

    it('leaves a figure that can not be worked out as null', () => {
        const [row] = bulkRows([character({ kills: 0, deaths: 0, totalPlayTimeMinutes: 0, killsPerHour: NaN, outfitAlias: undefined, world: undefined })]);

        expect([row.kdr, row.hsr, row.kph, row.alias, row.world]).toEqual([null, null, null, '', '']);
    });
});

describe('addNames', () => {
    it('splits at commas, trims, and skips blanks', () => {
        expect(addNames([], ' A , B,, ,C ')).toEqual(['A', 'B', 'C']);
    });

    it('skips a name already there, whatever its case', () => {
        expect(addNames(['Wakeful'], 'wakeful, Pyrrhic, PYRRHIC')).toEqual(['Wakeful', 'Pyrrhic']);
    });

    it('stops at the limit', () => {
        const many = Array.from({ length: MAX_NAMES + 5 }, (_, i) => 'p' + i).join(',');

        expect(addNames([], many)).toHaveLength(MAX_NAMES);
        expect(addNames(['x'], many, 3)).toEqual(['x', 'p0', 'p1']);
    });
});

describe('missingNames', () => {
    it('lists the names no character came back for, without regard to case', () => {
        expect(missingNames(['wakeful', 'Typo', 'Pyrrhic'], [character(), character({ name: 'Pyrrhic' })])).toEqual(['Typo']);
    });
});

describe('toCsv', () => {
    it('writes a header of every field and a row each, quoting what needs it', () => {
        const csv = toCsv([character({ name: 'A,"B"' }), character({ id: '2', name: 'C', outfitName: 'Void' })]);
        const lines = csv.trim().split('\n');

        expect(lines[0].split(',')).toContain('outfitName');
        expect(lines[1]).toContain('"A,""B"""');
        expect(lines).toHaveLength(3);
        expect(lines[1].split(',').length).toBeGreaterThan(5);
    });

    it('is just a newline when there is nothing to write', () => {
        expect(toCsv([])).toBe('\n');
    });
});
