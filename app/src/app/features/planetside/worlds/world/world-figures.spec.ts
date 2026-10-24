import { WorldOnlineState, WorldOnlineZoneState } from '@core/api/models/ps2/world-state.model';
import { agoLabel, zoneTiles } from './world-figures';

const zone = (id: number, extra: Partial<WorldOnlineZoneState> = {}): WorldOnlineZoneState =>
    ({ id, name: `Zone ${id}`, isTracking: true, population: { vs: 10, nc: 30, tr: 60, ns: 0 }, ...extra });

const world = (zoneStates: WorldOnlineZoneState[]): WorldOnlineState =>
    ({ id: 17, name: 'Emerald', isOnline: true, onlineCharacters: 100, zoneStates });

describe('zoneTiles', () => {
    it('has a tile per playable zone in zone order', () => {
        const tiles = zoneTiles(world([zone(6), zone(2), zone(95), zone(344)]), () => undefined);
        expect(tiles.map(tile => tile.id)).toEqual([2, 6, 344]);
    });

    it('shows each faction\'s players and share of a zone', () => {
        const [tile] = zoneTiles(world([zone(2)]), () => undefined);

        expect(tile.population).toBe(100);
        expect(tile.populations).toEqual({ vs: 10, nc: 30, tr: 60, ns: 0 });
        expect(tile.shares).toEqual({ vs: 10, nc: 30, tr: 60, ns: 0 });
    });

    it('shows a running alert with its players', () => {
        const alertState = { timestamp: '2026-10-20T10:00:00Z', metagameEvent: { id: 1, typeId: 1 } };
        const [tile] = zoneTiles(world([zone(2, { alertState })]), () => undefined);

        expect(tile.cell.kind).toBe('alert');
        expect(tile.population).toBe(100);
    });

    it('shows a lock with no figures', () => {
        const lockState = { state: 'LOCKED' as const, timestamp: '2026-10-20T10:00:00Z', triggeringFaction: 2 };
        const [tile] = zoneTiles(world([zone(4, { lockState })]), () => undefined);

        expect(tile).toMatchObject({ population: null, populations: null, shares: null, lockedBy: 2, lockedAt: '2026-10-20T10:00:00Z' });
    });

    it('has no share for an empty zone, and no figures for one not tracked', () => {
        const [empty, untracked] = zoneTiles(world([zone(2, { population: { vs: 0, nc: 0, tr: 0, ns: 0 } }), zone(4, { isTracking: false })]), () => undefined);

        expect(empty).toMatchObject({ population: 0, shares: null });
        expect(untracked).toMatchObject({ population: null, populations: null });
    });

    it('names a zone from the server, then the zone list, then its id', () => {
        const named = zoneTiles(world([zone(2), zone(4, { name: undefined }), zone(6, { name: undefined })]), id => (id === 4 ? 'Hossin' : undefined));

        expect(named.map(tile => tile.name)).toEqual(['Zone 2', 'Hossin', 'Zone 6']);
    });

    it('has no tiles before the server loads', () => {
        expect(zoneTiles(null, () => undefined)).toEqual([]);
    });
});

describe('agoLabel', () => {
    const now = Date.parse('2026-10-20T12:00:00Z');
    const ago = (minutes: number) => agoLabel(new Date(now - minutes * 60000).toISOString(), now);

    it('counts minutes, then hours, then days', () => {
        expect(ago(0)).toBe('just now');
        expect(ago(1)).toBe('1 minute ago');
        expect(ago(38)).toBe('38 minutes ago');
        expect(ago(60)).toBe('1 hour ago');
        expect(ago(5 * 60)).toBe('5 hours ago');
        expect(ago(3 * 24 * 60)).toBe('3 days ago');
    });

    it('is empty for a missing or unparseable time', () => {
        expect(agoLabel(undefined, now)).toBe('');
        expect(agoLabel('nope', now)).toBe('');
    });
});
