import { populationPoints, populationSeries, populationTotal } from './worlds-population-figures';

describe('populationTotal', () => {
    it('adds the three factions and leaves out Nanite Systems', () => {
        expect(populationTotal({ vs: 10, nc: 20, tr: 5 })).toBe(35);
    });
});

describe('populationPoints', () => {
    it('puts the samples in time order and skips those without a time', () => {
        const points = populationPoints([
            { timestamp: '2026-10-28T10:02:00Z', vs: 1, nc: 1, tr: 1, ns: 9 },
            { vs: 5, nc: 5, tr: 5, ns: 0 },
            { timestamp: '2026-10-28T10:01:00Z', vs: 2, nc: 2, tr: 2, ns: 0 }
        ]);

        expect(points.map(point => point.total)).toEqual([6, 3]);
    });

    it('is empty without a history', () => {
        expect(populationPoints(undefined)).toEqual([]);
    });
});

describe('populationSeries', () => {
    it('makes a coloured line for each server, by name', () => {
        const series = populationSeries(
            [{ id: 17, name: 'Emerald' }, { id: 13, name: 'Cobalt' }],
            { 13: [{ timestamp: '2026-10-28T10:00:00Z', vs: 1, nc: 2, tr: 3, ns: 0 }] }
        );

        expect(series.map(s => s.name)).toEqual(['Cobalt', 'Emerald']);
        expect(series[0].points.map(point => point.total)).toEqual([6]);
        expect(series[1].points).toEqual([]);
        expect(series[0].color).not.toBe(series[1].color);
    });
});
