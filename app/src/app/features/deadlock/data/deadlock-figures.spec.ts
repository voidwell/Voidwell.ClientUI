import { changeClass, formatMinutes, formatPercent, formatPoints, humanize, sortRows } from './deadlock-figures';

describe('deadlock figures', () => {
    it('writes a change in a rate as signed percentage points', () => {
        expect(formatPoints(0.0123)).toBe('+1.2');
        expect(formatPoints(-0.0456)).toBe('−4.6');
        expect(formatPoints(0)).toBe('0.0');
        expect(formatPoints(null)).toBe('—');
        expect(formatPoints(NaN)).toBe('—');
    });

    it('colours a change only when it is not zero', () => {
        expect(changeClass(0.02)).toBe('dl-up');
        expect(changeClass(-0.02)).toBe('dl-down');
        expect(changeClass(0.0001)).toBe('');
        expect(changeClass(undefined)).toBe('');
    });

    it('writes minutes as m:ss and rates as percentages, with a dash for what is missing', () => {
        expect(formatMinutes(31.5)).toBe('31:30');
        expect(formatMinutes(0.05)).toBe('0:03');
        expect(formatMinutes(null)).toBe('—');
        expect(formatPercent(0.5123)).toBe('51.2%');
        expect(formatPercent(null)).toBe('—');
    });

    it('writes a name in camel case or with underscores as words', () => {
        expect(humanize('laneCreeps')).toBe('Lane creeps');
        expect(humanize('lane_creeps')).toBe('Lane creeps');
        expect(humanize('kills')).toBe('Kills');
        expect(humanize(null)).toBe('');
    });

    describe('sortRows', () => {
        const rows = [{ n: 'b', v: 2 }, { n: 'a', v: null as number | null }, { n: 'c', v: 3 }, { n: 'd', v: 2 }];
        const valueOf = (row: { n: string; v: number | null }, key: string) => (key === 'n' ? row.n : row.v);

        it('sorts figures both ways and keeps rows that tie in their order', () => {
            expect(sortRows(rows, { active: 'v', direction: 'desc' }, valueOf).map(r => r.n)).toEqual(['c', 'b', 'd', 'a']);
            expect(sortRows(rows, { active: 'v', direction: 'asc' }, valueOf).map(r => r.n)).toEqual(['b', 'd', 'c', 'a']);
        });

        it('puts a missing value last whichever way it sorts, and sorts text', () => {
            expect(sortRows(rows, { active: 'n', direction: 'desc' }, valueOf).map(r => r.n)).toEqual(['d', 'c', 'b', 'a']);
            expect(sortRows(rows, { active: 'v', direction: '' }, valueOf).map(r => r.n)).toEqual(['b', 'a', 'c', 'd']);
        });
    });
});
