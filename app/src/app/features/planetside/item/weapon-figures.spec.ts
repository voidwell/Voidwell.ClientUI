import { roundsPerMinute, shotsToKill, timeToKill } from './weapon-figures';

describe('weapon figures', () => {
    it('works out rounds per minute', () => {
        expect(roundsPerMinute(80)).toBe(750);
        expect(roundsPerMinute(0)).toBeNull();
    });

    it('counts body shots and time to kill standard infantry', () => {
        expect(shotsToKill(143)).toBe(7);
        expect(shotsToKill(112)).toBe(9);
        expect(shotsToKill(1000)).toBe(1);
        expect(timeToKill(143, 80)).toBe(480);
        expect(timeToKill(112, 80)).toBe(640);
        expect(timeToKill(1000, 80)).toBe(0);
    });

    it('has nothing to say without damage or a fire rate', () => {
        expect(shotsToKill(undefined)).toBeNull();
        expect(timeToKill(143, undefined)).toBeNull();
    });
});
