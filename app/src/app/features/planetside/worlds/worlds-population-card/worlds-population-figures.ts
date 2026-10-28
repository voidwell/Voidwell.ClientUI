import { PopulationPeriod } from '@core/api/models/ps2/common.model';

/** A server whose population is plotted. */
export interface PopulationWorld {
    id: number;
    name: string;
}

/** The players online at one moment. */
export interface PopulationPoint {
    timestamp: Date;
    total: number;
}

/** One server's line of the chart. */
export interface WorldPopulationSeries extends PopulationWorld {
    color: string;
    points: PopulationPoint[];
}

/** Line colours, handed out by a server's place in the list so they stay put when the list is filtered. */
export const SERIES_COLORS = ['#4fc3f7', '#ffb74d', '#81c784', '#ba68c8', '#f06292', '#fff176', '#4db6ac', '#a1887f'];

/** The three factions added up; Nanite Systems is left out, as it is not a side of the fight. */
export function populationTotal(period: Pick<PopulationPeriod, 'vs' | 'nc' | 'tr'>): number {
    return period.vs + period.nc + period.tr;
}

/** The points of a server's history in time order, leaving out samples without a usable time. */
export function populationPoints(periods: PopulationPeriod[] | null | undefined): PopulationPoint[] {
    return (periods ?? [])
        .map(period => ({ timestamp: new Date(period.timestamp ?? NaN), total: populationTotal(period) }))
        .filter(point => !Number.isNaN(point.timestamp.getTime()))
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

/** A line for each server, by name, each with its own colour. */
export function populationSeries(worlds: PopulationWorld[], histories: Record<number, PopulationPeriod[] | null | undefined>): WorldPopulationSeries[] {
    return [...worlds]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((world, index) => ({
            ...world,
            color: SERIES_COLORS[index % SERIES_COLORS.length],
            points: populationPoints(histories[world.id])
        }));
}
