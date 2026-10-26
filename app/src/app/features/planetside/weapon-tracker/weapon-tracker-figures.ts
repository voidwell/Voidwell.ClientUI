import { OracleStatsByWeapon, SimpleItem } from '@core/api/models/ps2/weapon.model';

/** A plotted weapon as the table beneath the chart shows it. */
export interface TrackerRow {
    id: number;
    name: string;
    /** The colour of its line. */
    color: string;
    /** The most recent value; `null` when the weapon has no data. */
    latest: number | null;
    /** The highest value over everything plotted; `null` when the weapon has no data. */
    peak: number | null;
}

const isNumber = (value: number | null | undefined): value is number => typeof value === 'number' && isFinite(value);

/** One row per plotted weapon, in the order plotted, with its latest and highest value. */
export function trackerRows(weapons: SimpleItem[], stats: OracleStatsByWeapon, color: (index: number) => string): TrackerRow[] {
    return weapons.map((weapon, index) => {
        const points = (stats[weapon.id] ?? [])
            .map(point => ({ time: Date.parse(point.period), value: point.value }))
            .filter(point => !isNaN(point.time) && isNumber(point.value))
            .sort((a, b) => a.time - b.time);

        return {
            id: weapon.id,
            name: weapon.name || `Weapon ${weapon.id}`,
            color: color(index),
            latest: points.length ? points[points.length - 1].value : null,
            peak: points.length ? Math.max(...points.map(point => point.value)) : null
        };
    });
}

/** Whether the weapons picked are not the ones plotted, so the chart is out of date. */
export function selectionDiffers(selected: SimpleItem[], plotted: SimpleItem[]): boolean {
    return selected.length !== plotted.length || selected.some((weapon, index) => weapon.id !== plotted[index].id);
}

/** Text safe to put in markup. */
export function escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
