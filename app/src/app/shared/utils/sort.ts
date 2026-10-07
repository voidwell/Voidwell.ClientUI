import { SortDirection } from '@angular/material/sort';

export type SortValue = string | number | null | undefined;

/**
 * Compares two table cells for a Material sort header. Numeric strings compare
 * as numbers; the result is flipped for descending sorts.
 */
export function compareSortValues(a: SortValue, b: SortValue, direction: SortDirection): number {
    const valueA = isNaN(+a) ? a : +a;
    const valueB = isNaN(+b) ? b : +b;

    return ((valueA as number) < (valueB as number) ? -1 : 1) * (direction === 'asc' ? 1 : -1);
}
