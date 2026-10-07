import { definedParams } from './query-params';

describe('definedParams', () => {
    it('keeps only the parameters that have a value', () => {
        expect(definedParams({ a: '1', b: undefined, c: null, d: '', e: '0' })).toEqual({ a: '1', e: '0' });
    });
});
