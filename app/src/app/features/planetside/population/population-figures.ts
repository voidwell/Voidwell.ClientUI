import { DailyPopulation, World, WorldPopulationHistory } from '@core/api/models/ps2/world.model';

/** A plotted server as the table beneath the chart shows it. */
export interface PopulationRow {
    id: number;
    name: string;
    /** The colour of its line. */
    color: string;
    /** Players seen on the latest day with any, per faction. `null` when the server has no data. */
    vs: number | null;
    nc: number | null;
    tr: number | null;
    ns: number | null;
    /** The four factions added up on that day; `null` when the server has no data. */
    latest: number | null;
    /** The highest daily total over everything plotted; `null` when the server has no data. */
    peak: number | null;
}

/** The four factions of one day added up. */
export const dailyTotal = (day: Pick<DailyPopulation, 'vsCount' | 'ncCount' | 'trCount' | 'nsCount'>): number =>
    (day.vsCount || 0) + (day.ncCount || 0) + (day.trCount || 0) + (day.nsCount || 0);

/** One row per plotted server, in the order plotted, with the figures of its latest day and its highest total. */
export function populationRows(worlds: World[], history: WorldPopulationHistory, color: (index: number) => string): PopulationRow[] {
    return worlds.map((world, index) => {
        const days = (history[world.id] ?? [])
            .filter(day => !isNaN(Date.parse(day.date)) && dailyTotal(day) > 0)
            .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
        const last = days[days.length - 1];

        return {
            id: world.id,
            name: world.name || `Server ${world.id}`,
            color: color(index),
            vs: last ? last.vsCount || 0 : null,
            nc: last ? last.ncCount || 0 : null,
            tr: last ? last.trCount || 0 : null,
            ns: last ? last.nsCount || 0 : null,
            latest: last ? dailyTotal(last) : null,
            peak: days.length ? Math.max(...days.map(dailyTotal)) : null
        };
    });
}

/** Whether the servers picked are not the ones plotted, so the chart is out of date. */
export function selectionDiffers(selected: World[], plotted: World[]): boolean {
    return selected.length !== plotted.length || selected.some((world, index) => world.id !== plotted[index].id);
}

/** Text safe to put in markup. */
export function escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
