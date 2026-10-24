import { WorldOnlineState } from '@core/api/models/ps2/world-state.model';
import { isPlayableZone } from '../../data/zone.service';
import { FACTION_KEYS, FactionKey, ZoneCell, zoneCell } from '../world-list-figures';

/** A zone's tile in the server page's header. */
export interface ZoneTile {
    id: number;
    name: string;
    cell: ZoneCell;
    /** The zone's players; `null` when it shows none. */
    population: number | null;
    /** The faction that locked the zone and when; only for a locked zone. */
    lockedBy: number | null;
    lockedAt: string | null;
    /** Players per faction; `null` when the zone shows no population. */
    populations: Record<FactionKey, number> | null;
    /** Each faction's share of the zone's players, 0 to 100; `null` when nobody is there. */
    shares: Record<FactionKey, number> | null;
}

/** One tile per zone the server reports, in zone order. */
export function zoneTiles(world: WorldOnlineState | null, nameOf: (zoneId: number) => string | undefined): ZoneTile[] {
    return (world?.zoneStates ?? [])
        .filter(zone => isPlayableZone(zone.id))
        .sort((a, b) => a.id - b.id)
        .map(zone => {
            const cell = zoneCell(zone);
            const shown = cell.kind === 'alert' || cell.kind === 'population';
            const populations = shown && zone.population
                ? Object.fromEntries(FACTION_KEYS.map(key => [key, zone.population?.[key] ?? 0])) as Record<FactionKey, number>
                : null;
            const total = populations ? FACTION_KEYS.reduce((sum, key) => sum + populations[key], 0) : 0;

            return {
                id: zone.id,
                name: zone.name ?? nameOf(zone.id) ?? `Zone ${zone.id}`,
                cell,
                population: cell.kind === 'alert' || cell.kind === 'population' ? cell.population : null,
                lockedBy: cell.kind === 'locked' ? cell.factionId : null,
                lockedAt: cell.kind === 'locked' ? cell.timestamp : null,
                populations,
                shares: populations && total > 0
                    ? Object.fromEntries(FACTION_KEYS.map(key => [key, populations[key] / total * 100])) as Record<FactionKey, number>
                    : null
            };
        });
}

/** How long ago something happened, as "38 minutes ago"; empty for a missing or unparseable time. */
export function agoLabel(timestamp: string | undefined, now = Date.now()): string {
    const time = timestamp ? Date.parse(timestamp) : NaN;
    if (isNaN(time)) {
        return '';
    }

    const minutes = Math.max(0, Math.floor((now - time) / 60000));
    if (minutes < 1) {
        return 'just now';
    }
    if (minutes < 60) {
        return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 48) {
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    }
    return `${Math.floor(hours / 24)} days ago`;
}
