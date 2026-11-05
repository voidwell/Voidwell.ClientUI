import { CombatReportFactionKills } from '@core/api/models/ps2/combat-report.model';

/** Factions in the order the site lists them: VS, NC, TR, then NSO. */
const ORDER = [1, 2, 3, 4];

export interface KillFlowCell {
    victimFactionId: number;
    /** Null on the diagonal: a faction's own kills are team kills, shown apart. */
    kills: number | null;
    /** The share of the killer's enemy kills, or null on the diagonal or when there are none. */
    share: number | null;
    /** 0 to 1 against the largest cell, for the tint. */
    weight: number;
}

export interface KillFlowRow {
    factionId: number;
    cells: KillFlowCell[];
    enemyKills: number;
    teamkills: number;
}

export interface KillFlowPair {
    a: number;
    b: number;
    aKills: number;
    bKills: number;
    /** `a`'s share of the kills between the two. */
    aShare: number;
    /** The faction that killed more of the other, or null when even. */
    leader: number | null;
    margin: number;
}

export interface KillFlow {
    factions: number[];
    rows: KillFlowRow[];
    /** Deaths of each faction (in `factions` order) to the others. */
    deathsToEnemies: number[];
    pairs: KillFlowPair[];
}

/** Lays the faction kill counts out as a killer-by-victim grid plus head-to-head pairs, or null when there are none. */
export function buildKillFlow(factionKills: readonly CombatReportFactionKills[] | null | undefined): KillFlow | null {
    const counts = new Map<string, number>();
    const present = new Set<number>();
    for (const k of factionKills ?? []) {
        if (!k.kills) {
            continue;
        }
        const key = `${k.attackerFactionId}:${k.victimFactionId}`;
        counts.set(key, (counts.get(key) ?? 0) + k.kills);
        present.add(k.attackerFactionId);
        present.add(k.victimFactionId);
    }
    const factions = [...present].sort((a, b) => (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99) || a - b);
    if (!factions.some(a => factions.some(b => a !== b && counts.has(`${a}:${b}`)))) {
        return null;
    }

    const kills = (a: number, b: number) => counts.get(`${a}:${b}`) ?? 0;
    const max = Math.max(...factions.flatMap(a => factions.filter(b => b !== a).map(b => kills(a, b))));

    const rows = factions.map(a => {
        const enemyKills = factions.filter(b => b !== a).reduce((sum, b) => sum + kills(a, b), 0);
        return {
            factionId: a,
            enemyKills,
            teamkills: kills(a, a),
            cells: factions.map(b => a === b
                ? { victimFactionId: b, kills: null, share: null, weight: 0 }
                : { victimFactionId: b, kills: kills(a, b), share: enemyKills ? kills(a, b) / enemyKills : null, weight: max ? kills(a, b) / max : 0 })
        };
    });

    const deathsToEnemies = factions.map(b => factions.filter(a => a !== b).reduce((sum, a) => sum + kills(a, b), 0));

    // Head to head between the empires; NSO fight for any of them, so they have no side of their own here.
    const empires = factions.filter(f => f !== 4);
    const pairs: KillFlowPair[] = [];
    empires.forEach((a, i) => empires.slice(i + 1).forEach(b => {
        const aKills = kills(a, b);
        const bKills = kills(b, a);
        if (aKills + bKills === 0) {
            return;
        }
        pairs.push({
            a, b, aKills, bKills,
            aShare: aKills / (aKills + bKills),
            leader: aKills === bKills ? null : aKills > bKills ? a : b,
            margin: Math.abs(aKills - bKills)
        });
    }));

    return { factions, rows, deathsToEnemies, pairs };
}
