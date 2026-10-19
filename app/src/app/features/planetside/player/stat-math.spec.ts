import { hours, perHour, perMinute, ratio } from './stat-math';

describe('stat math', () => {
    it('divides, or gives null when there is nothing to divide by', () => {
        expect(ratio(3, 4)).toBe(0.75);
        expect(ratio(undefined, 4)).toBe(0);
        expect(ratio(3, 0)).toBeNull();
        expect(ratio(3, undefined)).toBeNull();
    });

    it('works out rates from play time in seconds', () => {
        expect(perHour(30, 7200)).toBe(15);
        expect(perMinute(600, 120)).toBe(300);
        expect(perHour(30, 0)).toBeNull();
        expect(hours(5400)).toBe(1.5);
        expect(hours(undefined)).toBe(0);
    });
});
