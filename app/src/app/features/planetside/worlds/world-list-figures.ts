import { WorldOnlineState, WorldOnlineZoneState } from '@core/api/models/ps2/world-state.model';
import { isPlayableZone } from '../data/zone.service';

export type FactionKey = 'vs' | 'nc' | 'tr' | 'ns';

export const FACTION_KEYS: FactionKey[] = ['vs', 'nc', 'tr', 'ns'];

/** What a zone's cell in the server list shows. */
export type ZoneCell =
    | { kind: 'alert'; population: number }
    | { kind: 'locked'; factionId: number; timestamp: string }
    | { kind: 'population'; population: number }
    | { kind: 'none' };

/** The ids of the zones any server reports, in zone order: the table's zone columns. */
export function zoneColumnIds(worlds: WorldOnlineState[]): number[] {
    const ids = new Set<number>();
    for (const world of worlds) {
        for (const zone of world.zoneStates ?? []) {
            if (isPlayableZone(zone.id)) {
                ids.add(zone.id);
            }
        }
    }
    return [...ids].sort((a, b) => a - b);
}

export function zonePopulation(zone: WorldOnlineZoneState): number {
    const population = zone.population;
    return population ? population.vs + population.nc + population.tr + population.ns : 0;
}

/** A zone's cell: a running alert, a lock by a faction, its population, or nothing when there is no data. */
export function zoneCell(zone: WorldOnlineZoneState | undefined): ZoneCell {
    if (!zone) {
        return { kind: 'none' };
    }
    if (zone.alertState) {
        return { kind: 'alert', population: zonePopulation(zone) };
    }
    if (zone.lockState?.state === 'LOCKED') {
        return { kind: 'locked', factionId: zone.lockState.triggeringFaction ?? 0, timestamp: zone.lockState.timestamp };
    }
    if (!zone.isTracking || !zone.population) {
        return { kind: 'none' };
    }
    return { kind: 'population', population: zonePopulation(zone) };
}

/** A faction's players across a server's zone columns; `null` for an offline server or one with no zone data. */
export function factionTotal(world: WorldOnlineState, faction: FactionKey): number | null {
    const zones = (world.zoneStates ?? []).filter(zone => isPlayableZone(zone.id));
    if (!world.isOnline || !zones.length) {
        return null;
    }
    return zones.reduce((total, zone) => total + (zone.population?.[faction] ?? 0), 0);
}
