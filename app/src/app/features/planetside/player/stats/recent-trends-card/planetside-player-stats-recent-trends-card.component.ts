import { Component, computed, input, signal } from '@angular/core';
import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { MatCard, MatCardTitle } from '@angular/material/card';
import { CharacterDetails } from '@core/api/models/ps2/character.model';
import { ChipOption, ChipsComponent } from '@shared/ui/vw-chips/vw-chips.component';
import { hours, perHour, perMinute, ratio } from '../../stat-math';
import { TrendBucket, TrendRange, buildTrends, change, niceCeiling, totalTrends } from './recent-trends';

type TrendMetric = 'kdr' | 'kph' | 'spm' | 'kills' | 'time';

interface MetricDef {
    label: string;
    /** The figure of one bucket, or null when it can't be worked out. */
    of: (b: TrendBucket) => number | null;
    /** For the kills chart: deaths, drawn below the zero line. */
    down?: (b: TrendBucket) => number | null;
    digits: string;
    unit?: string;
    /** The lifetime figure drawn as a reference line, for ratios. */
    lifetime?: (t: { kills: number; deaths: number; seconds: number; score: number }) => number | null;
}

const METRICS: Record<TrendMetric, MetricDef> = {
    kdr: { label: 'KDR', of: b => ratio(b.kills, b.deaths), digits: '1.2-2', lifetime: t => ratio(t.kills, t.deaths) },
    kph: { label: 'Kills / hour', of: b => perHour(b.kills, b.seconds), digits: '1.1-1', lifetime: t => perHour(t.kills, t.seconds) },
    spm: { label: 'Score / min', of: b => perMinute(b.score, b.seconds), digits: '1.0-0', lifetime: t => perMinute(t.score, t.seconds) },
    kills: { label: 'Kills / deaths', of: b => b.played ? b.kills : null, down: b => b.played ? b.deaths : null, digits: '1.0-0' },
    time: { label: 'Time played', of: b => b.played ? hours(b.seconds) : null, digits: '1.1-1', unit: ' h' }
};

const RANGE_CAPTION: Record<TrendRange, string> = { day: 'last 30 days', week: 'last 13 weeks', month: 'last 12 months' };
const RANGE_UNIT: Record<TrendRange, string> = { day: 'day', week: 'week', month: 'month' };
/** Label every nth bar so the axis doesn't crowd. */
const LABEL_EVERY: Record<TrendRange, number> = { day: 5, week: 2, month: 1 };

export interface TrendTile {
    label: string;
    hint: string;
    value: string;
    sub: string;
    /** The change from lifetime as a fraction, or null when there's nothing to compare. */
    change: number | null;
}

export interface TrendBar {
    start: Date;
    up: number | null;
    down: number | null;
    /** Heights as a percentage of their half (or of the whole chart when nothing is drawn below). */
    upHeight: number;
    downHeight: number;
    label: boolean;
}

@Component({
    selector: 'planetside-player-stats-recent-trends-card',
    templateUrl: './planetside-player-stats-recent-trends-card.component.html',
    styleUrls: ['../stat-card.css', './planetside-player-stats-recent-trends-card.component.css'],
    imports: [MatCard, MatCardTitle, ChipsComponent, DecimalPipe, PercentPipe, DatePipe]
})
export class PlanetsidePlayerStatsRecentTrendsCardComponent {
    readonly player = input.required<CharacterDetails>();

    readonly range = signal<TrendRange>('day');
    readonly metric = signal<TrendMetric>('kdr');
    readonly hovered = signal<number | null>(null);

    readonly rangeOptions: ChipOption<TrendRange>[] = [
        { value: 'day', label: '30 days' },
        { value: 'week', label: '13 weeks' },
        { value: 'month', label: '12 months' }
    ];
    readonly metricOptions: ChipOption<TrendMetric>[] = (Object.keys(METRICS) as TrendMetric[]).map(value => ({ value, label: METRICS[value].label }));

    readonly trends = computed(() => buildTrends(this.player().statsHistory, this.range(), this.player().times?.lastSaveDate));
    readonly caption = computed(() => RANGE_CAPTION[this.range()]);
    readonly unit = computed(() => RANGE_UNIT[this.range()]);
    readonly def = computed(() => METRICS[this.metric()]);
    readonly diverging = computed(() => !!this.def().down);

    readonly tiles = computed<TrendTile[]>(() => {
        const trends = this.trends();
        if (!trends) {
            return [];
        }
        const t = totalTrends(trends.buckets);
        const life = trends.lifetime;
        const vsLifetime = (label: string, hint: string, value: number | null, lifetime: number | null, digits: string): TrendTile => ({
            label, hint,
            value: this.format(value, digits),
            sub: lifetime === null ? 'No lifetime figure' : `Lifetime ${this.format(lifetime, digits)}`,
            change: change(value, lifetime)
        });
        return [
            vsLifetime('KDR', 'Kills divided by deaths over the period', ratio(t.kills, t.deaths), ratio(life.kills, life.deaths), '1.2-2'),
            vsLifetime('Kills / hour', 'Kills per hour played', perHour(t.kills, t.seconds), perHour(life.kills, life.seconds), '1.1-1'),
            vsLifetime('Score / min', 'Score per minute played', perMinute(t.score, t.seconds), perMinute(life.score, life.seconds), '1.0-0'),
            { label: 'Kills', hint: 'Kills over the period', value: this.format(t.kills, '1.0-0'), sub: `${this.format(t.deaths, '1.0-0')} deaths`, change: null },
            { label: 'Time played', hint: 'Hours logged in over the period', value: `${this.format(hours(t.seconds), '1.1-1')} h`, sub: `${t.played} of ${trends.buckets.length} ${this.unit()}s active`, change: null },
            { label: 'Bases', hint: 'Facilities captured and defended over the period', value: `${this.format(t.captures, '1.0-0')} / ${this.format(t.defends, '1.0-0')}`, sub: 'captured / defended', change: null }
        ];
    });

    readonly anyPlayed = computed(() => !!this.trends()?.buckets.some(b => b.played));

    readonly lifetimeLine = computed(() => {
        const trends = this.trends();
        const lifetime = this.def().lifetime;
        return trends && lifetime ? lifetime(trends.lifetime) : null;
    });

    readonly axisMax = computed(() => {
        const trends = this.trends();
        if (!trends) {
            return 1;
        }
        const def = this.def();
        const peaks = trends.buckets.flatMap(b => [def.of(b), def.down?.(b) ?? null]).filter((v): v is number => v !== null);
        return niceCeiling(Math.max(0, ...peaks, this.lifetimeLine() ?? 0));
    });

    readonly bars = computed<TrendBar[]>(() => {
        const trends = this.trends();
        if (!trends) {
            return [];
        }
        const def = this.def();
        const max = this.axisMax();
        const every = LABEL_EVERY[this.range()];
        const last = trends.buckets.length - 1;
        const height = (v: number | null) => v === null ? 0 : Math.max(1.5, v / max * 100);
        return trends.buckets.map((b, i) => {
            const up = def.of(b);
            const down = def.down?.(b) ?? null;
            return { start: b.start, up, down, upHeight: height(up), downHeight: height(down), label: (last - i) % every === 0 };
        });
    });

    readonly lifetimeOffset = computed(() => {
        const line = this.lifetimeLine();
        return line === null ? null : line / this.axisMax() * 100;
    });

    readonly hoveredBar = computed(() => {
        const i = this.hovered();
        return i === null ? null : this.bars()[i] ?? null;
    });

    readonly hoveredBucket = computed(() => {
        const i = this.hovered();
        return i === null ? null : this.trends()?.buckets[i] ?? null;
    });

    /** Where the tooltip sits along the chart, as a percentage, kept clear of the edges. */
    readonly tooltipLeft = computed(() => {
        const i = this.hovered();
        const n = this.bars().length;
        return i === null || !n ? 0 : Math.min(85, Math.max(15, (i + .5) / n * 100));
    });

    readonly chartLabel = computed(() => {
        const def = this.def();
        const what = this.diverging() ? 'Kills above and deaths below a shared zero line' : def.label;
        const line = this.lifetimeLine();
        return `${what} per ${this.unit()} over the ${this.caption()}` + (line === null ? '' : `, with the lifetime figure of ${this.format(line, def.digits)} marked`);
    });

    readonly dateFormat = computed(() => this.range() === 'month' ? 'MMM y' : 'MMM d');

    readonly bucketTitle = computed(() => {
        const b = this.hoveredBucket();
        if (!b) {
            return '';
        }
        const format = this.range() === 'month' ? 'MMMM y' : 'MMM d, y';
        const date = new DatePipe('en-US').transform(b.start, format, 'UTC');
        return this.range() === 'week' ? `Week of ${date}` : date;
    });

    kdr(bucket: TrendBucket): number | null {
        return ratio(bucket.kills, bucket.deaths);
    }

    format(value: number | null, digits: string): string {
        return value === null ? '—' : new DecimalPipe('en-US').transform(value, digits) ?? '—';
    }
}
