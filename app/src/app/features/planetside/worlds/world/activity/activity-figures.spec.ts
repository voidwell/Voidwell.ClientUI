import { CombatReportParticipantStats } from '@core/api/models/ps2/combat-report.model';
import { WorldActivityStats } from '@core/api/models/ps2/world.model';
import { cellOf, factionStatRows, formatTimespan, kdr, sortRows, topOutfitRows, topPlayerRows } from './activity-figures';

const fv = (vs: number, nc: number, tr: number, ns: number) => ({ vs, nc, tr, ns });
const zero = fv(0, 0, 0, 0);

const STATS: WorldActivityStats = {
    kills: fv(100, 300, 200, 900), deaths: fv(50, 50, 60, 10), headshots: zero, teamKills: fv(5, 1, 1, 0), suicides: zero,
    vehicleKills: fv(10, 10, 5, 0), kdr: fv(2, 6, Infinity, NaN), hsr: zero
};

describe('sortRows', () => {
    const rows = [{ name: 'beta', kills: 5 as number | null }, { name: 'Alpha', kills: null }, { name: 'gamma', kills: 9 }];

    it('sorts figures both ways with missing figures last either way', () => {
        expect(sortRows(rows, { active: 'kills', direction: 'desc' }, cellOf).map(r => r.name)).toEqual(['gamma', 'beta', 'Alpha']);
        expect(sortRows(rows, { active: 'kills', direction: 'asc' }, cellOf).map(r => r.name)).toEqual(['beta', 'gamma', 'Alpha']);
    });

    it('sorts text without regard to case', () => {
        expect(sortRows(rows, { active: 'name', direction: 'asc' }, cellOf).map(r => r.name)).toEqual(['Alpha', 'beta', 'gamma']);
    });

    it('leaves the order alone without a direction, and never changes the source', () => {
        expect(sortRows(rows, { active: 'kills', direction: '' }, cellOf)).toEqual(rows);
        sortRows(rows, { active: 'kills', direction: 'desc' }, cellOf);
        expect(rows.map(r => r.name)).toEqual(['beta', 'Alpha', 'gamma']);
    });
});

describe('factionStatRows', () => {
    const rows = factionStatRows(STATS);
    const row = (label: string) => rows.find(r => r.label === label)!;

    it('is empty without stats', () => {
        expect(factionStatRows(undefined)).toEqual([]);
    });

    it('marks the one of VS, NC and TR ahead where more is better, never NS', () => {
        expect(row('Kills').leader).toBe('nc');
        expect(row('K/D').leader).toBe('nc');
    });

    it('marks no one on a tie, at zero, or where fewer is better', () => {
        expect(row('Vehicle kills').leader).toBeNull();
        expect(row('Headshots').leader).toBeNull();
        expect(row('Deaths').leader).toBeNull();
        expect(row('TKs').leader).toBeNull();
    });

    it('shows a figure that cannot be worked out as missing', () => {
        expect(row('K/D').values).toEqual({ vs: 2, nc: 6, tr: null, ns: null });
    });
});

describe('topPlayerRows', () => {
    const now = new Date('2026-10-20T11:00:00Z');
    const player = (extra: Partial<CombatReportParticipantStats> = {}): CombatReportParticipantStats => ({
        character: { id: '1', name: 'Wakeful', factionId: 2, battleRank: 100 }, outfit: { alias: 'VKTZ' },
        kills: 60, deaths: 0, headshots: 15, suicides: 1, teamkills: 0, vehicleKills: 2, sessionKills: 90,
        loginDate: '2026-10-20T09:30:00Z', ...extra
    });

    it('works out the figures, leaving out what cannot be', () => {
        const [row] = topPlayerRows([player()], 60, now);

        expect(row).toMatchObject({ id: '1', name: 'Wakeful', alias: 'VKTZ', kdr: null, hsr: 0.25, kpm: 1, sessionKpm: 1, playTime: '1h 30m' });
    });

    it('has no session figures for a player without a login', () => {
        const [row] = topPlayerRows([player({ loginDate: undefined, sessionKills: 0 })], 60, now);

        expect(row.sessionKpm).toBeNull();
        expect(row.playTime).toBeNull();
    });

    it('skips players without a character and handles no players', () => {
        expect(topPlayerRows([player({ character: undefined })], 60, now)).toEqual([]);
        expect(topPlayerRows(undefined, 60, now)).toEqual([]);
    });
});

describe('topOutfitRows', () => {
    it('averages per active member and has no figure without members or deaths', () => {
        const [row] = topOutfitRows([{
            outfit: { id: '9', name: 'Void', factionId: 1 }, kills: 100, deaths: 0, headshots: 20, suicides: 0, teamkills: 0,
            vehicleKills: 0, participantCount: 0, facilityCaptures: 3
        }]);

        expect(row).toMatchObject({ kdr: null, killsPerMember: null, deathsPerMember: null, hsr: 0.2, captures: 3 });
        expect(row.alias).toBeUndefined();
    });
});

describe('figures', () => {
    it('formats a span as hours and minutes', () => {
        expect(formatTimespan(58 * 60000)).toBe('58m');
        expect(formatTimespan(65 * 60000)).toBe('1h 5m');
        expect(formatTimespan(null)).toBeNull();
        expect(formatTimespan(0)).toBeNull();
    });

    it('gives no ratio without a divisor', () => {
        expect(kdr(5, 0)).toBeNull();
        expect(kdr(5, 2)).toBe(2.5);
    });
});
