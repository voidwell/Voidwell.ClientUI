import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { CurveAnalyticsRepository } from '@core/api/deadlock/match-analytics.repository';
import { CurvePoint, CurveStats } from '@core/api/models/deadlock/deadlock.model';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ChipOption, ChipsComponent } from '@shared/ui/vw-chips/vw-chips.component';
import { DeadlockLineChartComponent, LineSeries } from '../../components/line-chart/deadlock-line-chart.component';
import { humanize, SERIES_COLORS } from '../../data/deadlock-figures';
import { deadlockResource } from '../../data/deadlock-resource';
import { DeadlockHeroContext } from '../deadlock-hero-context.service';

type Metric = Exclude<keyof CurveStats, 'samples'>;

const METRICS: { value: Metric; label: string }[] = [
    { value: 'netWorth', label: 'Souls' },
    { value: 'level', label: 'Level' },
    { value: 'kills', label: 'Kills' },
    { value: 'deaths', label: 'Deaths' },
    { value: 'assists', label: 'Assists' },
    { value: 'playerDamage', label: 'Damage' },
    { value: 'playerDamageTaken', label: 'Damage taken' },
    { value: 'playerHealing', label: 'Healing' },
    { value: 'weaponPower', label: 'Weapon power' },
    { value: 'techPower', label: 'Spirit power' },
    { value: 'maxHealth', label: 'Max health' }
];

/** Colours for the sources of souls, in the order the API lists them. */
const SOURCE_COLORS = ['#e57373', '#6cb6ff', '#5fcf8a', '#e8a05b', '#b388ff', '#4dd0e1', '#8a9ba1'];

@Component({
    templateUrl: './deadlock-hero-progression.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, DecimalPipe, PercentPipe, LoaderComponent, ErrorCardComponent, ChipsComponent, DeadlockLineChartComponent]
})
export class DeadlockHeroProgressionComponent {
    private readonly curveRepository = inject(CurveAnalyticsRepository);
    private readonly hero = inject(DeadlockHeroContext);

    readonly curves = deadlockResource((query, id: number) => this.curveRepository.getHeroCurves(id, query), () => this.hero.heroId());
    readonly sources = deadlockResource((query, id: number) => this.curveRepository.getSoulsSources(id, query), () => this.hero.heroId());

    readonly metric = signal<Metric>('netWorth');
    readonly metricOptions: ChipOption<Metric>[] = METRICS;

    readonly metricLabel = computed(() => METRICS.find(metric => metric.value === this.metric())?.label ?? '');

    readonly series = computed<LineSeries[]>(() => {
        const points = this.curves.value()?.points ?? [];
        const metric = this.metric();
        const line = (label: string, color: string, stats: (point: CurvePoint) => CurveStats | null): LineSeries => ({
            label,
            color,
            points: points.map(point => ({ x: point.minute, y: stats(point)?.[metric] ?? null }))
        });

        return [
            line('All players', SERIES_COLORS.all, point => point.all),
            line('Winners', SERIES_COLORS.winners, point => point.winners),
            line('Losers', SERIES_COLORS.losers, point => point.losers)
        ];
    });

    readonly minuteLabel = (x: number): string => `${x}m`;
    readonly valueLabel = (y: number): string => (Math.abs(y) >= 1000 ? `${(y / 1000).toFixed(1)}k` : String(Math.round(y * 10) / 10));

    /** The share of souls from each source at each sample time, as bars in the order the sources come. */
    readonly sourceBars = computed(() => {
        const points = this.sources.value()?.points ?? [];
        const order = points[0]?.sources.map(source => source.source) ?? [];
        return points.map(point => ({
            minute: point.minute,
            samples: point.samples,
            netWorth: point.netWorth,
            segments: point.sources.map(source => ({
                name: humanize(source.source),
                share: source.share,
                souls: source.souls,
                color: SOURCE_COLORS[Math.min(Math.max(order.indexOf(source.source), 0), SOURCE_COLORS.length - 1)]
            }))
        }));
    });

    readonly legend = computed(() => (this.sourceBars()[0]?.segments ?? []).map(segment => ({ name: segment.name, color: segment.color })));
}
