import { Sort } from '@angular/material/sort';

/** Colours of the chart series, shared so a series reads the same on every page. */
export const SERIES_COLORS = {
    all: '#6cb6ff',
    winners: '#5fcf8a',
    losers: '#e57373',
    accent: '#e8a05b'
} as const;

export const isNumber = (value: number | null | undefined): value is number => typeof value === 'number' && isFinite(value);

/** A change in a rate (a fraction) as percentage points with its sign, or a dash when it is not known. */
export function formatPoints(change: number | null | undefined): string {
    if (!isNumber(change)) {
        return '—';
    }

    const points = Math.round(change * 1000) / 10;
    return points === 0 ? '0.0' : `${points > 0 ? '+' : '−'}${Math.abs(points).toFixed(1)}`;
}

/** The style class of a change: green for better, red for worse. */
export function changeClass(change: number | null | undefined): string {
    if (!isNumber(change) || Math.round(change * 1000) === 0) {
        return '';
    }
    return change > 0 ? 'dl-up' : 'dl-down';
}

/** Minutes as `m:ss`, or a dash when they are not known. */
export function formatMinutes(minutes: number | null | undefined): string {
    if (!isNumber(minutes)) {
        return '—';
    }

    const total = Math.round(minutes * 60);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** The name of a hero archetype or an item slot, capitalised. */
export function titleCase(value: string | null | undefined): string {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
}

/** A name written as `laneCreeps` or `lane_creeps` as words: `Lane creeps`. */
export function humanize(value: string | null | undefined): string {
    const words = (value ?? '').replace(/[_-]+/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2').trim().toLowerCase();
    return titleCase(words);
}

/** A fraction as a percentage with one decimal, or a dash. */
export function formatPercent(rate: number | null | undefined): string {
    return isNumber(rate) ? `${(rate * 100).toFixed(1)}%` : '—';
}

export type SortKey = string | number | null | undefined;

/**
 * The rows ordered by the sort a table header asks for. A value that is missing sorts last whichever way the sort goes,
 * and rows that tie keep their order.
 */
export function sortRows<T>(rows: readonly T[], sort: Sort, valueOf: (row: T, key: string) => SortKey): T[] {
    if (!sort.active || !sort.direction) {
        return [...rows];
    }

    const direction = sort.direction === 'asc' ? 1 : -1;
    const present = (value: SortKey): value is string | number => value !== null && value !== undefined && !(typeof value === 'number' && !isFinite(value));

    return rows
        .map((row, index) => ({ row, index, value: valueOf(row, sort.active) }))
        .sort((a, b) => {
            if (!present(a.value) || !present(b.value)) {
                return present(a.value) === present(b.value) ? a.index - b.index : present(a.value) ? -1 : 1;
            }

            const order = typeof a.value === 'string' || typeof b.value === 'string'
                ? String(a.value).localeCompare(String(b.value))
                : a.value - b.value;
            return order * direction || a.index - b.index;
        })
        .map(entry => entry.row);
}
