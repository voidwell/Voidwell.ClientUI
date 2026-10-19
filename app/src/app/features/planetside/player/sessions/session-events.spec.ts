import { PlayerSessionEvent } from '@core/api/models/ps2/character.model';
import { activityBuckets, formatDuration, matchesFilter, sessionStats, toLogEntry, weaponUsage, zonesVisited } from './session-events';

const ME = { id: 'me', name: 'Me', factionId: 1 };
const ENEMY = { id: 'enemy', name: 'Enemy', factionId: 2 };
const ALLY = { id: 'ally', name: 'Ally', factionId: 1 };

const death = (attacker: typeof ME, victim: typeof ME, weapon = { id: 1, name: 'Orion' }, isHeadshot = false, timestamp = '2026-01-01T10:00:00Z'): PlayerSessionEvent =>
    ({ eventType: 'Death', attacker, victim, weapon, isHeadshot, timestamp, zoneId: 2 });

const vehicle = (attacker: typeof ME, victim: typeof ME): PlayerSessionEvent =>
    ({ eventType: 'VehicleDestroy', attacker, victim, weapon: { id: 9 }, victimVehicle: { id: 2, name: 'Sunderer' }, timestamp: '2026-01-01T10:00:00Z', zoneId: 4 });

const kinds = (events: PlayerSessionEvent[]) => events.map(event => toLogEntry(event, 'me').kind);

describe('session events', () => {
    it('tells kills, deaths, teamkills and suicides apart from the player\'s side', () => {
        const events = [death(ME, ENEMY), death(ENEMY, ME), death(ME, ALLY), death(ME, ME), death(ALLY, ME)];

        expect(kinds(events)).toEqual(['kill', 'death', 'teamkill', 'suicide', 'death']);
        expect(toLogEntry(events[0], 'me').other).toBe(ENEMY);
        expect(toLogEntry(events[1], 'me').other).toBe(ENEMY);
    });

    it('counts the player\'s own vehicle as lost, whoever destroyed it', () => {
        expect(kinds([vehicle(ME, ENEMY), vehicle(ENEMY, ME), vehicle(ME, ME)])).toEqual(['vehicleKill', 'vehicleLoss', 'vehicleLoss']);
    });

    it('sums up the session, counting suicides as deaths as the game does', () => {
        const entries = [
            death(ME, ENEMY, undefined, true), death(ME, ENEMY), death(ME, ENEMY), death(ENEMY, ME), death(ME, ME), death(ME, ALLY),
            vehicle(ME, ENEMY), vehicle(ENEMY, ME),
            { eventType: 'FacilityCapture', timestamp: '2026-01-01T10:00:00Z' } as PlayerSessionEvent
        ].map(event => toLogEntry(event, 'me'));

        const stats = sessionStats(entries);

        expect(stats).toEqual(expect.objectContaining({
            kills: 3, deaths: 2, headshots: 1, teamkills: 1, suicides: 1, vehicleKills: 1, vehiclesLost: 1,
            facilitiesCaptured: 1, facilitiesDefended: 0, kdr: 1.5
        }));
        expect(stats.headshotRatio).toBeCloseTo(33.33, 2);
    });

    it('gives the kills as K/D when there were no deaths', () => {
        expect(sessionStats([toLogEntry(death(ME, ENEMY), 'me')]).kdr).toBe(1);
        expect(sessionStats([]).kdr).toBe(0);
    });

    it('counts kills by weapon, variants with the same name together', () => {
        const entries = [
            death(ME, ENEMY, { id: 1, name: 'Nebula' }), death(ME, ENEMY, { id: 2, name: 'Nebula' }, true),
            death(ME, ENEMY, { id: 3, name: 'Orion' }), death(ENEMY, ME, { id: 4, name: 'Gauss' })
        ].map(event => toLogEntry(event, 'me'));

        expect(weaponUsage(entries).map(usage => [usage.weapon.name, usage.kills, usage.headshots])).toEqual([['Nebula', 2, 1], ['Orion', 1, 0]]);
    });

    it('spreads kills and deaths over equal slices of the session', () => {
        const start = Date.parse('2026-01-01T10:00:00Z');
        const entries = [
            death(ME, ENEMY, undefined, false, '2026-01-01T10:01:00Z'),
            death(ME, ENEMY, undefined, false, '2026-01-01T10:59:00Z'),
            death(ENEMY, ME, undefined, false, '2026-01-01T10:59:30Z'),
            death(ENEMY, ME, undefined, false, '2026-01-01T11:30:00Z')
        ].map(event => toLogEntry(event, 'me'));

        const buckets = activityBuckets(entries, start, start + 3600000, 4);

        expect(buckets.map(b => [b.kills, b.deaths])).toEqual([[1, 0], [0, 0], [0, 0], [1, 2]]);
    });

    it('filters the log by kind of event', () => {
        const entries = [death(ME, ENEMY), vehicle(ME, ENEMY)].map(event => toLogEntry(event, 'me'));

        expect(entries.filter(entry => matchesFilter(entry, 'combat')).length).toBe(1);
        expect(entries.filter(entry => matchesFilter(entry, 'vehicles')).length).toBe(1);
        expect(entries.filter(entry => matchesFilter(entry, 'facilities')).length).toBe(0);
        expect(entries.filter(entry => matchesFilter(entry, 'all')).length).toBe(2);
    });

    it('lists the continents in the order they were reached', () => {
        expect(zonesVisited([death(ME, ENEMY), vehicle(ME, ENEMY), death(ME, ENEMY), { eventType: 'Login', timestamp: '' }])).toEqual([2, 4]);
    });

    it('formats durations as hours and minutes', () => {
        expect(formatDuration(8435000)).toBe('2h 21m');
        expect(formatDuration(3158000)).toBe('53m');
        expect(formatDuration(0)).toBe('0m');
    });
});
