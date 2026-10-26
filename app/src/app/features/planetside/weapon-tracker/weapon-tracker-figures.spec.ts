import { OracleStatsByWeapon } from '@core/api/models/ps2/weapon.model';
import { escapeHtml, selectionDiffers, trackerRows } from './weapon-tracker-figures';

const color = (index: number) => `#c${index}`;

describe('trackerRows', () => {
    const weapons = [{ id: 1, name: 'NS-15M' }, { id: 2, name: 'Gauss SAW' }, { id: 3 }];

    it('gives each weapon its latest and highest value, with its line colour, in the order plotted', () => {
        const stats: OracleStatsByWeapon = {
            1: [{ period: '2026-10-02T00:00:00Z', value: 50 }, { period: '2026-10-01T00:00:00Z', value: 80 }, { period: '2026-10-03T00:00:00Z', value: 30 }],
            2: [{ period: '2026-10-01T00:00:00Z', value: 10 }]
        };

        const rows = trackerRows(weapons, stats, color);

        expect(rows.map(r => [r.id, r.name, r.color, r.latest, r.peak])).toEqual([
            [1, 'NS-15M', '#c0', 30, 80],
            [2, 'Gauss SAW', '#c1', 10, 10],
            [3, 'Weapon 3', '#c2', null, null]
        ]);
    });

    it('counts a zero as a value, and ignores points without one', () => {
        const stats: OracleStatsByWeapon = {
            1: [{ period: '2026-10-01T00:00:00Z', value: 7 }, { period: '2026-10-02T00:00:00Z', value: 0 }, { period: '2026-10-03T00:00:00Z' }]
        };

        expect(trackerRows(weapons, stats, color)[0]).toMatchObject({ latest: 0, peak: 7 });
    });

    it('has no data for a weapon missing from the response or with unreadable dates', () => {
        const rows = trackerRows(weapons, { 2: [{ period: 'nope', value: 5 }] }, color);

        expect(rows[0]).toMatchObject({ latest: null, peak: null });
        expect(rows[1]).toMatchObject({ latest: null, peak: null });
    });
});

describe('selectionDiffers', () => {
    const a = { id: 1 };
    const b = { id: 2 };

    it('is false for the same weapons in the same order', () => {
        expect(selectionDiffers([a, b], [{ id: 1 }, { id: 2 }])).toBe(false);
        expect(selectionDiffers([], [])).toBe(false);
    });

    it('is true when a weapon was added, removed or swapped', () => {
        expect(selectionDiffers([a, b], [a])).toBe(true);
        expect(selectionDiffers([a], [a, b])).toBe(true);
        expect(selectionDiffers([a, b], [b, a])).toBe(true);
    });
});

describe('escapeHtml', () => {
    it('escapes what could open markup', () => {
        expect(escapeHtml('<b>"A" & B</b>')).toBe('&lt;b&gt;&quot;A&quot; &amp; B&lt;/b&gt;');
    });
});
