import { isPs2Platform, loadSavedPlatform, savePlatform } from './platforms';

describe('platforms', () => {
    afterEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('recognizes the three platforms', () => {
        expect(['pc', 'ps4us', 'ps4eu'].every(isPs2Platform)).toBe(true);
        expect(isPs2Platform('xbox')).toBe(false);
        expect(isPs2Platform(null)).toBe(false);
    });

    it('remembers the picked platform', () => {
        savePlatform('ps4us');

        expect(loadSavedPlatform()).toBe('ps4us');
    });

    it('falls back to pc when nothing valid is saved', () => {
        expect(loadSavedPlatform()).toBe('pc');

        localStorage.setItem('voidwell-ps2-platform', 'xbox');
        expect(loadSavedPlatform()).toBe('pc');
    });

    it('falls back to pc when storage is blocked', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });

        expect(() => savePlatform('ps4eu')).not.toThrow();
        expect(loadSavedPlatform()).toBe('pc');
    });
});
