import { OutfitMemberDetails } from '@core/api/models/ps2/outfit.model';

const DAY = 24 * 60 * 60 * 1000;

/** A member's ratios; `null` where there is nothing to divide by, so the figure shows as a dash. */
export const kdr = (member: OutfitMemberDetails): number | null => {
    const stats = member.lifetimeStats;
    return stats?.weaponDeaths ? (stats.weaponKills ?? 0) / stats.weaponDeaths : null;
};
export const accuracy = (member: OutfitMemberDetails): number | null => {
    const stats = member.lifetimeStats;
    return stats?.weaponFireCount ? (stats.weaponHitCount ?? 0) / stats.weaponFireCount : null;
};
export const hsr = (member: OutfitMemberDetails): number | null => {
    const stats = member.lifetimeStats;
    return stats?.weaponKills ? (stats.weaponHeadshots ?? 0) / stats.weaponKills : null;
};
/** Captures per defence, as a percentage. */
export const siege = (member: OutfitMemberDetails): number | null => {
    const stats = member.lifetimeStats;
    return stats?.facilityDefendedCount ? (stats.facilityCaptureCount ?? 0) / stats.facilityDefendedCount * 100 : null;
};
/** Score per minute; play time is in seconds. */
export const spm = (member: OutfitMemberDetails): number | null => {
    const stats = member.lifetimeStats;
    return stats?.weaponPlayTime ? (stats.weaponScore ?? 0) / (stats.weaponPlayTime / 60) : null;
};

export const mean = (values: number[]): number | null => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null);

export const median = (values: number[]): number | null => {
    if (!values.length) {
        return null;
    }
    const sorted = [...values].sort((a, b) => a - b);
    const half = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2;
};

/** How long before `now` a date was, as "3 days ago"; empty for a missing or unparseable date. */
export function timeAgo(date: string | null | undefined, now = Date.now()): string {
    const time = date ? Date.parse(date) : NaN;
    if (isNaN(time)) {
        return '';
    }

    const days = Math.floor((now - time) / DAY);
    if (days < 1) {
        const hours = Math.floor((now - time) / (60 * 60 * 1000));
        return hours < 1 ? 'Just now' : hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    }
    if (days === 1) {
        return 'Yesterday';
    }
    if (days < 14) {
        return `${days} days ago`;
    }
    if (days < 60) {
        return `${Math.floor(days / 7)} weeks ago`;
    }
    if (days < 730) {
        return `${Math.floor(days / 30)} months ago`;
    }
    return `${Math.floor(days / 365)} years ago`;
}

/** Whether a date falls within the last `days` days. */
export const isWithin = (date: string | null | undefined, days: number, now = Date.now()): boolean => {
    const time = date ? Date.parse(date) : NaN;
    return !isNaN(time) && now - time <= days * DAY;
};
