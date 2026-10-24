import { OnlineCharacter } from '@core/api/models/ps2/character.model';
import { ALL_FACTIONS, filterPlayers, onlinePlayerRows, playerCounts } from './online-players-figures';

const player = (name: string, factionId: number, extra: Partial<OnlineCharacter> = {}): OnlineCharacter => ({
    character: { characterId: name.toLowerCase(), name, factionId, worldId: 17 },
    lastSeen: { timestamp: '2026-10-20T11:50:00Z', zoneId: 2 },
    loginDate: '2026-10-20T11:00:00Z',
    ...extra
});

const NOW = Date.parse('2026-10-20T12:00:00Z');
const zoneName = (id: number) => (id === 2 ? 'Indar' : undefined);

describe('onlinePlayerRows', () => {
    it('names the zone and counts the minutes online', () => {
        const [row] = onlinePlayerRows([player('Alpha', 1)], zoneName, NOW);

        expect(row).toEqual({ id: 'alpha', name: 'Alpha', factionId: 1, zoneName: 'Indar', loginDate: '2026-10-20T11:00:00Z', onlineMinutes: 60 });
    });

    it('leaves out what is not known', () => {
        const [row] = onlinePlayerRows([player('Alpha', 1, { lastSeen: undefined, loginDate: 'nope' }), player('Bravo', 1, { lastSeen: { timestamp: '', zoneId: 99 } })], zoneName, NOW);

        expect(row).toMatchObject({ zoneName: null, loginDate: '', onlineMinutes: null });
    });

    it('skips entries without a character', () => {
        expect(onlinePlayerRows([{ loginDate: '2026-10-20T11:00:00Z' }], zoneName, NOW)).toEqual([]);
    });
});

describe('filterPlayers and playerCounts', () => {
    const rows = onlinePlayerRows([player('Alpha', 1), player('alphonse', 2), player('Bravo', 2), player('Charlie', 3)], zoneName, NOW);

    it('filters by faction, and everyone is the default', () => {
        expect(filterPlayers(rows, 2, '').map(r => r.name)).toEqual(['alphonse', 'Bravo']);
        expect(filterPlayers(rows, ALL_FACTIONS, '')).toHaveLength(4);
    });

    it('filters by name without regard to case or surrounding space', () => {
        expect(filterPlayers(rows, ALL_FACTIONS, ' ALPH ').map(r => r.name)).toEqual(['Alpha', 'alphonse']);
        expect(filterPlayers(rows, 2, 'alph').map(r => r.name)).toEqual(['alphonse']);
    });

    it('counts every faction, zero when empty', () => {
        expect(playerCounts(rows)).toEqual({ 0: 4, 1: 1, 2: 2, 3: 1, 4: 0 });
    });
});
