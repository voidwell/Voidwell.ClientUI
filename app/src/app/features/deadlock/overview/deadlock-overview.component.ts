import { Component, computed, inject } from '@angular/core';
import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatchAnalyticsRepository } from '@core/api/deadlock/match-analytics.repository';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { BarPoint, DeadlockBarChartComponent } from '../components/bar-chart/deadlock-bar-chart.component';
import { deadlockResource } from '../data/deadlock-resource';
import { formatMinutes, formatPercent, titleCase } from '../data/deadlock-figures';

@Component({
    templateUrl: './deadlock-overview.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, DecimalPipe, PercentPipe, DatePipe, LoaderComponent, ErrorCardComponent, DeadlockBarChartComponent]
})
export class DeadlockOverviewComponent {
    private readonly repository = inject(MatchAnalyticsRepository);

    readonly overview = deadlockResource(query => this.repository.getOverview(query));
    readonly ranks = deadlockResource(query => this.repository.getRanks(query));

    readonly formatMinutes = formatMinutes;
    readonly formatPercent = formatPercent;
    readonly titleCase = titleCase;

    readonly dailyBars = computed<BarPoint[]>(() => (this.overview.value()?.daily ?? []).map(day => ({
        label: new Date(day.day + 'T00:00:00Z').toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' }),
        value: day.matches,
        title: `${day.day}: ${day.matches.toLocaleString()} matches, ${formatMinutes(day.avgMatchMinutes)} on average`
    })));

    readonly dailyLabelEvery = computed(() => Math.max(1, Math.ceil(this.dailyBars().length / 8)));

    readonly durationBars = computed<BarPoint[]>(() => (this.overview.value()?.duration.histogram ?? []).map(bucket => ({
        label: bucket.toMinute === null ? `${bucket.fromMinute}+` : String(bucket.fromMinute),
        value: bucket.matches,
        title: `${bucket.fromMinute}${bucket.toMinute === null ? '+' : '–' + bucket.toMinute} min: ${formatPercent(bucket.share)} of matches`
    })));

    readonly hourBars = computed<BarPoint[]>(() => (this.overview.value()?.hours ?? []).map(hour => ({
        label: String(hour.hour),
        value: hour.matchesPerDay,
        title: `${String(hour.hour).padStart(2, '0')}:00 UTC: ${Math.round(hour.matchesPerDay).toLocaleString()} matches a day`
    })));

    readonly rankBars = computed<BarPoint[]>(() => (this.ranks.value()?.ranks ?? []).map(rank => ({
        label: String(rank.tier),
        value: rank.matches,
        title: `${rank.tierName}: ${formatPercent(rank.share)} of matches`
    })));
}
