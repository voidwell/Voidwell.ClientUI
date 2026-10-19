import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import * as d3 from 'd3';

/** Slice colours, assigned in order of playtime. */
const COLORS = ['#3b82f6', '#8b5cf6', '#14b8a6', '#fbbf24', '#f97316', '#ef4444', '#ec4899', '#84cc16'];

/** One thing the player spent time on, e.g. a class or a vehicle. */
export interface UsageEntry {
    id: number | string;
    name: string;
    /** Playtime in seconds. */
    playTime: number;
    /** Overrides the colour picked from the palette, e.g. to grey out an "Other" entry. */
    color?: string;
}

export interface UsageSlice {
    id: number | string;
    name: string;
    color: string;
    percent: number;
    hours: number;
    path: string;
}

/** Donut chart of playtime with a legend, in the order the entries are given. */
@Component({
    selector: 'planetside-player-stats-usage-donut',
    templateUrl: './planetside-player-stats-usage-donut.component.html',
    styleUrls: ['./planetside-player-stats-usage-donut.component.css'],
    imports: [DecimalPipe]
})

export class PlanetsidePlayerStatsUsageDonutComponent {
    readonly entries = input.required<UsageEntry[]>();
    /** Accessible name of the chart. */
    readonly label = input.required<string>();

    readonly totalHours = computed(() => this.entries().reduce((sum, entry) => sum + entry.playTime, 0) / 3600);

    readonly slices = computed<UsageSlice[]>(() => {
        const entries = this.entries();
        const total = entries.reduce((sum, entry) => sum + entry.playTime, 0);
        const arc = d3.arc<d3.PieArcDatum<number>>().innerRadius(55).outerRadius(78).padAngle(0.02).cornerRadius(2);
        const arcs = d3.pie<number>().sort(null)(entries.map(entry => entry.playTime));

        return entries.map((entry, i) => ({
            id: entry.id,
            name: entry.name,
            color: entry.color ?? COLORS[i % COLORS.length],
            percent: entry.playTime / total * 100,
            hours: entry.playTime / 3600,
            path: arc(arcs[i]) ?? ''
        }));
    });
}
