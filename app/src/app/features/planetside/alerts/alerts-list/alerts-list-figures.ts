import { AlertView, alertEnd } from '../../components/alert-view';
import { FactionKey } from '../../worlds/world-list-figures';

/** A finished alert as the list's table shows it. */
export interface PastAlertRow {
    key: string;
    worldId: number;
    instanceId: number;
    name: string;
    serverName: string;
    zoneName: string;
    startDate: Date;
    startedAt: number;
    durationMinutes: number | null;
    vs: number | null;
    nc: number | null;
    tr: number | null;
    /** The one faction with the highest score, if there is one. */
    leader: FactionKey | null;
}

/** The alerts that are still running, each with an end date for its countdown. */
export function activeAlerts(alerts: AlertView[], now = new Date()): AlertView[] {
    return alerts
        .filter(alert => alertEnd(alert) > now)
        .map(alert => ({ ...alert, endDate: alertEnd(alert) }));
}

/** The alerts that have ended, with the names the table sorts by. */
export function pastAlertRows(alerts: AlertView[], serverName: (worldId: number) => string, zoneName: (zoneId: number) => string, now = new Date()): PastAlertRow[] {
    return alerts
        .filter(alert => alertEnd(alert) <= now)
        .map(alert => {
            const scores = { vs: alert.lastFactionVs ?? null, nc: alert.lastFactionNc ?? null, tr: alert.lastFactionTr ?? null };
            const best = Math.max(...Object.values(scores).map(score => score ?? -Infinity));
            const leaders = (['vs', 'nc', 'tr'] as const).filter(key => scores[key] === best);

            return {
                key: `${alert.worldId}/${alert.metagameInstanceId}`,
                worldId: alert.worldId,
                instanceId: alert.metagameInstanceId,
                name: alert.metagameEvent?.name ?? 'Alert',
                serverName: serverName(alert.worldId),
                zoneName: alert.zoneId ? zoneName(alert.zoneId) : '',
                startDate: alert.startDate,
                startedAt: alert.startDate.getTime(),
                durationMinutes: Math.round((alertEnd(alert).getTime() - alert.startDate.getTime()) / 60000),
                ...scores,
                leader: best > 0 && leaders.length === 1 ? leaders[0] : null
            };
        });
}
