import { DeadlockFilterService } from './deadlock-filter.service';

describe('DeadlockFilterService', () => {
    it('starts with ranked matches of the last 30 days, at every rank', () => {
        expect(new DeadlockFilterService().query()).toEqual({ mode: 'ranked', days: 30 });
    });

    it('narrows ranked matches to a bracket of rank tiers', () => {
        const filter = new DeadlockFilterService();
        filter.bracket.set('mid');

        expect(filter.query()).toEqual({ mode: 'ranked', days: 30, minTier: 4, maxTier: 7 });
    });

    it('leaves the rank tiers out of other modes, since only ranked matches have a rank', () => {
        const filter = new DeadlockFilterService();
        filter.bracket.set('high');
        filter.mode.set('unranked');

        expect(filter.query()).toEqual({ mode: 'unranked', days: 30 });
    });

    it('asks for the latest patch instead of a number of days', () => {
        const filter = new DeadlockFilterService();
        filter.period.set('patch');

        expect(filter.query()).toEqual({ mode: 'ranked', patch: 'latest' });
    });
});
