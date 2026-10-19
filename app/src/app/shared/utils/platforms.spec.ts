import { Ps2Platform } from '@core/api/models/ps2/common.model';
import { PLATFORMS } from '@core/platform/platforms';
import { groupByPlatform } from './platforms';

describe('groupByPlatform', () => {
    const item = (platform: Ps2Platform, name: string) => ({ platform, name });

    it('groups items by platform, in platform order', () => {
        const groups = groupByPlatform([item('ps4eu', 'a'), item('pc', 'b'), item('ps4us', 'c'), item('pc', 'd')]);

        expect(groups.map(g => g.platform.id)).toEqual(['pc', 'ps4us', 'ps4eu']);
        expect(groups[0].items.map(i => i.name)).toEqual(['b', 'd']);
    });

    it('leaves out platforms without items', () => {
        const groups = groupByPlatform([item('ps4us', 'a')]);

        expect(groups).toHaveLength(1);
        expect(groups[0].platform).toBe(PLATFORMS.find(p => p.id === 'ps4us'));
    });

    it('returns no groups for no items', () => {
        expect(groupByPlatform([])).toEqual([]);
    });

    it('keeps the original item objects, so changes to them show up in the group', () => {
        const original = item('pc', 'a');

        groupByPlatform([original])[0].items[0].name = 'changed';

        expect(original.name).toBe('changed');
    });
});
