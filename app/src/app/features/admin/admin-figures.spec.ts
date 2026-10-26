import { CustomEvent } from '@core/api/models/platform/custom-event.model';
import { ADMIN_SECTIONS, permittedSections } from './admin-sections';
import { eventRows, filterSessions, formatTimeSpan, parseTimeSpan, sessionRows } from './admin-figures';

describe('parseTimeSpan', () => {
    it('reads a .NET time span in seconds', () => {
        expect(parseTimeSpan('00:30:00')).toBe(1800);
        expect(parseTimeSpan('1.06:00:00')).toBe(108000);
        expect(parseTimeSpan('00:00:01.5000000')).toBe(1);
    });

    it('is null for anything else', () => {
        expect([parseTimeSpan('soon'), parseTimeSpan(''), parseTimeSpan(undefined)]).toEqual([null, null, null]);
    });
});

describe('formatTimeSpan', () => {
    it('words the two largest units', () => {
        expect(formatTimeSpan('1.00:00:00')).toBe('1 day');
        expect(formatTimeSpan('06:00:00')).toBe('6 hours');
        expect(formatTimeSpan('1.06:30:00')).toBe('1 day 6 hours');
        expect(formatTimeSpan('00:30:00')).toBe('30 minutes');
        expect(formatTimeSpan('00:00:01')).toBe('1 second');
    });

    it('shows a dash for nothing, and the text itself when it is not a time span', () => {
        expect(formatTimeSpan('00:00:00')).toBe('—');
        expect(formatTimeSpan(undefined)).toBe('—');
        expect(formatTimeSpan('soon')).toBe('soon');
    });
});

describe('eventRows', () => {
    const event = (overrides: Partial<CustomEvent>): CustomEvent => ({ id: 1, name: 'Finals', startDate: '2026-10-24T19:00:00Z', endDate: '2026-10-24T22:00:00Z', isPrivate: false, ...overrides });

    it('names the server and map, and falls back to the id when the name is not known', () => {
        const rows = eventRows([event({ serverId: '17', mapId: '2' }), event({ id: 2, serverId: '99', mapId: '98' })], { 17: 'Osprey' }, { 2: 'Indar' });

        expect(rows.map(row => [row.server, row.map])).toEqual([['Osprey', 'Indar'], ['99', '98']]);
    });

    it('leaves the server and map empty when the event has none', () => {
        const [row] = eventRows([event({})], {}, {});

        expect([row.server, row.map]).toEqual(['', '']);
    });
});

describe('sessionRows and filterSessions', () => {
    const rows = sessionRows([
        { characterId: '5428', name: 'Wakeful', sessionId: 1, loginDate: '2026-10-25T20:14:00Z', logoutDate: '2026-10-25T22:48:00Z', duration: 9240000 },
        { characterId: '5429', name: 'Pyrrhic', sessionId: 2 }
    ]);

    it('turns the duration into minutes, and leaves it null when it is not known', () => {
        expect(rows.map(row => row.minutes)).toEqual([154, null]);
    });

    it('finds players by part of their name, or by their exact character id', () => {
        expect(filterSessions(rows, 'wake').map(row => row.name)).toEqual(['Wakeful']);
        expect(filterSessions(rows, '5429').map(row => row.name)).toEqual(['Pyrrhic']);
        expect(filterSessions(rows, '54').length).toBe(0);
        expect(filterSessions(rows, ' ').length).toBe(2);
    });
});

describe('permittedSections', () => {
    it('lists every area for an administrator', () => {
        expect(permittedSections(['Administrator']).map(section => section.path)).toEqual(ADMIN_SECTIONS.map(section => section.path));
    });

    it('lists only the areas of the roles a user has', () => {
        expect(permittedSections(['Blog', 'PSB']).map(section => section.path)).toEqual(['psb', 'blog']);
    });

    it('lists nothing without roles', () => {
        expect(permittedSections(undefined)).toEqual([]);
        expect(permittedSections([])).toEqual([]);
    });
});
