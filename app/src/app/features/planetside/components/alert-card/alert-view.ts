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
