import { RatingCharacter } from '@core/api/models/ps2/reference.model';
import { World } from '@core/api/models/ps2/world.model';
import { playerRankRows } from './player-ranks-figures';

const WORLDS: World[] = [{ id: 17, name: 'Osprey', isActive: true }, { id: 40, name: 'Wainwright', isActive: true }];
const player = (overrides: Partial<RatingCharacter>): RatingCharacter => ({
    characterId: '1', name: 'A', factionId: 1, worldId: 17, battleRank: 100, rating: 2000, deviation: 40, ...overrides
});

describe('playerRankRows', () => {
    it('ranks the players by rating, keeping the order of those with the same rating', () => {
        const rows = playerRankRows([
            player({ characterId: '1', name: 'Low', rating: 1500 }),
            player({ characterId: '2', name: 'First tie', rating: 2000 }),
            player({ characterId: '3', name: 'Top', rating: 2500 }),
            player({ characterId: '4', name: 'Second tie', rating: 2000 })
        ], WORLDS);

        expect(rows.map(row => [row.rank, row.name])).toEqual([[1, 'Top'], [2, 'First tie'], [3, 'Second tie'], [4, 'Low']]);
    });

    it('names the server, and leaves it null when it is not known', () => {
        const rows = playerRankRows([player({ worldId: 40 }), player({ characterId: '2', worldId: 99 }), player({ characterId: '3', worldId: undefined })], WORLDS);

        expect(rows.map(row => row.world)).toEqual(['Wainwright', null, null]);
        expect(playerRankRows([player({})], null)[0].world).toBeNull();
    });

    it('leaves a figure that is not known as null, and skips a player with no rating', () => {
        const rows = playerRankRows([player({ battleRank: undefined, deviation: NaN }), player({ characterId: '2', rating: undefined as unknown as number })], WORLDS);

        expect(rows).toHaveLength(1);
        expect([rows[0].battleRank, rows[0].deviation]).toEqual([null, null]);
    });
});
