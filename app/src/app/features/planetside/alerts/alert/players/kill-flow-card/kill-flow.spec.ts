import { CombatReportFactionKills } from '@core/api/models/ps2/combat-report.model';
import { buildKillFlow } from './kill-flow';

const k = (attackerFactionId: number, victimFactionId: number, kills: number): CombatReportFactionKills => ({ attackerFactionId, victimFactionId, kills });

describe('buildKillFlow', () => {
    const sample = [
        k(1, 1, 96), k(1, 2, 2410), k(1, 3, 1730), k(1, 4, 140),
        k(2, 1, 2180), k(2, 2, 121), k(2, 3, 2050),
        k(3, 1, 1910), k(3, 2, 2390), k(3, 3, 88),
        k(4, 2, 135)
    ];

    it('lays the kills out killer by victim, with team kills apart', () => {
        const flow = buildKillFlow(sample);

        expect(flow.factions).toEqual([1, 2, 3, 4]);
        const vs = flow.rows[0];
        expect(vs.cells.map(c => c.kills)).toEqual([null, 2410, 1730, 140]);
        expect(vs.enemyKills).toBe(4280);
        expect(vs.teamkills).toBe(96);
        expect(vs.cells[1].share).toBeCloseTo(2410 / 4280);
        expect(flow.rows[3].cells.map(c => c.kills)).toEqual([0, 135, 0, null]);
    });

    it('totals each faction\'s deaths to the others, leaving out team kills', () => {
        expect(buildKillFlow(sample).deathsToEnemies).toEqual([2180 + 1910, 2410 + 2390 + 135, 1730 + 2050, 140]);
    });

    it('scales the tint against the largest cell', () => {
        const flow = buildKillFlow(sample);

        expect(flow.rows[0].cells[1].weight).toBe(1);
        expect(flow.rows[0].cells[0].weight).toBe(0);
    });

    it('pairs the empires head to head, without NSO', () => {
        const pairs = buildKillFlow(sample).pairs;

        expect(pairs.map(p => [p.a, p.b, p.aKills, p.bKills, p.leader, p.margin])).toEqual([
            [1, 2, 2410, 2180, 1, 230],
            [1, 3, 1730, 1910, 3, 180],
            [2, 3, 2050, 2390, 3, 340]
        ]);
    });

    it('calls an even pair even', () => {
        expect(buildKillFlow([k(1, 2, 5), k(2, 1, 5)]).pairs[0].leader).toBeNull();
    });

    it('returns null without kills between factions', () => {
        expect(buildKillFlow(undefined)).toBeNull();
        expect(buildKillFlow([])).toBeNull();
        expect(buildKillFlow([k(1, 1, 3)])).toBeNull();
    });
});
