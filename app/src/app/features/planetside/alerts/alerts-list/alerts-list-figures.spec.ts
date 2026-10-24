import { AlertView } from '../../components/alert-view';
import { activeAlerts, pastAlertRows } from './alerts-list-figures';

const NOW = new Date('2026-10-20T12:00:00Z');
const minutes = (n: number) => new Date(NOW.getTime() + n * 60000);

const alert = (id: number, extra: Partial<AlertView> = {}): AlertView => ({
    worldId: 17, metagameInstanceId: id, zoneId: 2, startDate: minutes(-90), endDate: minutes(-45),
    lastFactionVs: 41, lastFactionNc: 33, lastFactionTr: 26, metagameEvent: { id: 1, name: 'Indar Superiority' }, ...extra
});

const names = { server: () => 'Emerald', zone: () => 'Indar' };

describe('activeAlerts', () => {
    it('keeps the alerts still running and gives each an end date', () => {
        const running = alert(1, { startDate: minutes(-10), endDate: null });
        const over = alert(2);

        const result = activeAlerts([running, over], NOW);

        expect(result.map(a => a.metagameInstanceId)).toEqual([1]);
        expect(result[0].endDate).toEqual(minutes(35));
    });
});

describe('pastAlertRows', () => {
    it('lists the alerts that ended, with the names and the duration', () => {
        const [row] = pastAlertRows([alert(1)], names.server, names.zone, NOW);

        expect(row).toMatchObject({ key: '17/1', name: 'Indar Superiority', serverName: 'Emerald', zoneName: 'Indar', durationMinutes: 45, vs: 41, nc: 33, tr: 26, leader: 'vs' });
    });

    it('leaves out running alerts', () => {
        expect(pastAlertRows([alert(1, { endDate: minutes(10) })], names.server, names.zone, NOW)).toEqual([]);
    });

    it('names no leader for a tie, and keeps a missing score as missing', () => {
        const [tie, partial] = pastAlertRows([
            alert(1, { lastFactionVs: 34, lastFactionNc: 34, lastFactionTr: 32 }),
            alert(2, { lastFactionVs: undefined, lastFactionNc: 60, lastFactionTr: 40 })
        ], names.server, names.zone, NOW);

        expect(tie.leader).toBeNull();
        expect(partial).toMatchObject({ vs: null, leader: 'nc' });
    });

    it('has no zone name for an alert without a zone', () => {
        const [row] = pastAlertRows([alert(1, { zoneId: undefined })], names.server, names.zone, NOW);

        expect(row.zoneName).toBe('');
    });
});
