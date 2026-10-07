/** Input transform for components that take a date but are handed an ISO string by the API. */
export function toDate(value: Date | string | null | undefined): Date {
    return value == null ? undefined : new Date(value);
}
