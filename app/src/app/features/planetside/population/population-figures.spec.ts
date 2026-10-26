import { DailyPopulation, World } from '@core/api/models/ps2/world.model';
import { dailyTotal, escapeHtml, populationRows, selectionDiffers } from './population-figures';

const world = (id: number, name?: string): World => ({ id, name, isActive: true });
const day = (date: string, vs: number, nc: number, tr: number, ns: number): DailyPopulation => ({
    date, worldId: 1, vsCount: vs, ncCount: nc, trCount: tr, nsCount: ns,
    vsAvgPlayTime: 0, ncAvgPlayTime: 0, trAvgPlayTime: 0, nsAvgPlayTime: 0, avgPlayTime: 0
});
const color = (index: number) => `c${index}`;

describe('dailyTotal', () => {
    it('adds the four factions, treating a missing count as zero', () => {
        expect(dailyTotal(day('2026-10-01', 1, 2, 3, 4))).toBe(10);
        expect(dailyTotal({ vsCount: 5, ncCount: undefined as unknown as number, trCount: 0, nsCount: 1 })).toBe(6);
    });
});

describe('populationRows', () => {
    it('takes the factions and total of the latest day with players, and the highest total as the peak', () => {
        const history = {
            1: [day('2026-10-03', 0, 0, 0, 0), day('2026-10-02', 10, 20, 30, 5), day('2026-10-01', 100, 100, 100, 0)]
        };

        expect(populationRows([world(1, 'Osprey')], history, color)).toEqual([
            { id: 1, name: 'Osprey', color: 'c0', vs: 10, nc: 20, tr: 30, ns: 5, latest: 65, peak: 300 }
        ]);
    });

    it('keeps the order plotted and colours each server by its position', () => {
        const history = { 1: [day('2026-10-01', 1, 1, 1, 1)], 2: [day('2026-10-01', 2, 2, 2, 2)] };
        const rows = populationRows([world(2, 'B'), world(1, 'A')], history, color);

        expect(rows.map(row => [row.name, row.color])).toEqual([['B', 'c0'], ['A', 'c1']]);
    });

    it('gives a server with no players a row of nulls, and names one that has no name', () => {
        const rows = populationRows([world(7), world(8, 'Empty')], { 8: [day('2026-10-01', 0, 0, 0, 0)] }, color);

        expect(rows[0].name).toBe('Server 7');
        for (const row of rows) {
            expect([row.vs, row.nc, row.tr, row.ns, row.latest, row.peak]).toEqual([null, null, null, null, null, null]);
        }
    });
});

describe('selectionDiffers', () => {
    it('is false for the same servers in the same order, and true for any other', () => {
        expect(selectionDiffers([world(1), world(2)], [world(1), world(2)])).toBe(false);
        expect(selectionDiffers([world(1)], [world(1), world(2)])).toBe(true);
        expect(selectionDiffers([world(2), world(1)], [world(1), world(2)])).toBe(true);
    });
});

describe('escapeHtml', () => {
    it('escapes markup', () => {
        expect(escapeHtml('<b>"A" & B</b>')).toBe('&lt;b&gt;&quot;A&quot; &amp; B&lt;/b&gt;');
    });
});
