import { Component, computed, inject } from '@angular/core';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { formatPercent, SERIES_COLORS } from '../../data/deadlock-figures';
import { DeadlockLineChartComponent, LineSeries } from '../../components/line-chart/deadlock-line-chart.component';
import { DeadlockHeroContext } from '../deadlock-hero-context.service';

@Component({
    templateUrl: './deadlock-hero-overview.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, DecimalPipe, PercentPipe, DeadlockLineChartComponent]
})
export class DeadlockHeroOverviewComponent {
    readonly detail = inject(DeadlockHeroContext).detail;

    readonly formatPercent = formatPercent;

    private readonly days = computed(() => this.detail.value()?.daily ?? []);

    readonly winSeries = computed<LineSeries[]>(() => [{
        label: 'Win rate',
        color: SERIES_COLORS.winners,
        points: this.days().map(day => ({ x: Date.parse(day.day), y: day.winRate }))
    }]);

    readonly pickSeries = computed<LineSeries[]>(() => [{
        label: 'Pick rate',
        color: SERIES_COLORS.all,
        points: this.days().map(day => ({ x: Date.parse(day.day), y: day.pickRate }))
    }]);

    readonly dayLabel = (x: number): string => new Date(x).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
    readonly rateLabel = (y: number): string => `${(y * 100).toFixed(1)}%`;

    /** The tiers' win rates in proportion, with the 50% mark as the baseline everything is read against. */
    readonly tiers = computed(() => this.detail.value()?.byTier ?? []);
}
