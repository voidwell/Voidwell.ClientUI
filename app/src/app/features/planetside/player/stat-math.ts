/** `value / of`, or `null` when there is nothing to divide by, so a figure shows as a dash instead of NaN or Infinity. */
export function ratio(value: number | null | undefined, of: number | null | undefined): number | null {
    return of ? (value ?? 0) / of : null;
}

/** A count per hour of play, from play time in seconds. */
export function perHour(count: number | null | undefined, seconds: number | null | undefined): number | null {
    return ratio(count, (seconds ?? 0) / 3600);
}

/** A count per minute of play, from play time in seconds. */
export function perMinute(count: number | null | undefined, seconds: number | null | undefined): number | null {
    return ratio(count, (seconds ?? 0) / 60);
}

/** Play time in seconds as hours. */
export function hours(seconds: number | null | undefined): number {
    return (seconds ?? 0) / 3600;
}
