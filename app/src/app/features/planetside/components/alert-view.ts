import { Alert } from '@core/api/models/ps2/alert.model';

/** An alert with its timestamps parsed, as rendered by the alert card. */
export type AlertView = Omit<Alert, 'startDate' | 'endDate'> & {
    startDate: Date;
    endDate: Date | null;
};

export function toAlertView(alert: Alert): AlertView {
    return {
        ...alert,
        startDate: new Date(alert.startDate),
        endDate: alert.endDate ? new Date(alert.endDate) : null
    };
}

/** How long an alert with no end date is assumed to run. */
export const DEFAULT_ALERT_MINUTES = 45;

/** When an alert ended, or is due to end. */
export function alertEnd(alert: Pick<AlertView, 'startDate' | 'endDate'>): Date {
    return alert.endDate ?? new Date(alert.startDate.getTime() + DEFAULT_ALERT_MINUTES * 60000);
}
