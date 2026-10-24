import { WorldOnlineState, WorldOnlineZoneState } from '@core/api/models/ps2/world-state.model';
import { factionTotal, zoneCell, zoneColumnIds } from './world-list-figures';

const zone = (id: number, extra: Partial<WorldOnlineZoneState> = {}): WorldOnlineZoneState =>
    ({ id, isTracking: true, population: { vs: 1, nc: 2, tr: 3, ns: 4 }, ...extra });

const world = (zoneStates: WorldOnlineZoneState[], extra: Partial<WorldOnlineState> = {}): WorldOnlineState =>
    ({ id: 1, name: 'Emerald', isOnline: true, onlineCharacters: 10, zoneStates, ...extra });

describe('zoneColumnIds', () => {
    it('lists every zone any server reports once, in zone order', () => {
        const worlds = [world([zone(6), zone(2)]), world([zone(2), zone(344), zone(4)])];
        expect(zoneColumnIds(worlds)).toEqual([2, 4, 6, 344]);
    });

    it('leaves out test and instance zones', () => {
        expect(zoneColumnIds([world([zone(2), zone(10), zone(14), zone(95)])])).toEqual([2]);
    });

    it('is empty without servers or zones', () => {
        expect(zoneColumnIds([])).toEqual([]);
        expect(zoneColumnIds([world(undefined)])).toEqual([]);
    });
});

describe('zoneCell', () => {
    it('shows the population of a tracked zone, zero included', () => {
        expect(zoneCell(zone(2))).toEqual({ kind: 'population', population: 10 });
        expect(zoneCell(zone(2, { population: { vs: 0, nc: 0, tr: 0, ns: 0 } }))).toEqual({ kind: 'population', population: 0 });
    });

    it('shows a running alert with the population', () => {
        const alertState = { timestamp: '2026-10-20T10:00:00Z', metagameEvent: { id: 1, typeId: 1 } };
        expect(zoneCell(zone(2, { alertState }))).toEqual({ kind: 'alert', population: 10 });
    });

    it('shows the faction that locked a locked zone', () => {
        const lockState = { state: 'LOCKED' as const, timestamp: '2026-10-20T10:00:00Z', triggeringFaction: 2 };
        expect(zoneCell(zone(2, { lockState }))).toEqual({ kind: 'locked', factionId: 2, timestamp: '2026-10-20T10:00:00Z' });
    });

    it('shows nothing for an unlocked zone without data', () => {
        const lockState = { state: 'UNLOCKED' as const, timestamp: '2026-10-20T10:00:00Z', triggeringFaction: 2 };
        expect(zoneCell(zone(2, { lockState }))).toEqual({ kind: 'population', population: 10 });
        expect(zoneCell(zone(2, { isTracking: false }))).toEqual({ kind: 'none' });
        expect(zoneCell(zone(2, { population: undefined }))).toEqual({ kind: 'none' });
        expect(zoneCell(undefined)).toEqual({ kind: 'none' });
    });
});

describe('factionTotal', () => {
    it('adds a faction across the zones', () => {
        const emerald = world([zone(2), zone(4, { population: { vs: 5, nc: 0, tr: 0, ns: 0 } }), zone(6, { population: undefined })]);
        expect(factionTotal(emerald, 'vs')).toBe(6);
        expect(factionTotal(emerald, 'nc')).toBe(2);
    });

    it('has no figure for an offline server or one without zones', () => {
        expect(factionTotal(world([zone(2)], { isOnline: false }), 'vs')).toBeNull();
        expect(factionTotal(world([]), 'vs')).toBeNull();
        expect(factionTotal(world(undefined), 'vs')).toBeNull();
    });
});
