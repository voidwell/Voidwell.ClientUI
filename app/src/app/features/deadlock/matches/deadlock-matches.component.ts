import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { CompositionAnalyticsRepository, CurveAnalyticsRepository, MatchAnalyticsRepository } from '@core/api/deadlock/match-analytics.repository';
import { CompositionPoint } from '@core/api/models/deadlock/deadlock.model';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ChipOption, ChipsComponent } from '@shared/ui/vw-chips/vw-chips.component';
import { DeadlockLineChartComponent, LineSeries } from '../components/line-chart/deadlock-line-chart.component';
import { formatPercent, SERIES_COLORS, sortRows } from '../data/deadlock-figures';
import { deadlockResource } from '../data/deadlock-resource';

/** The most compositions the table lists; the rest are rare. */
const COMPOSITIONS_SHOWN = 25;

type LeadView = 'curve' | number;

@Component({
    templateUrl: './deadlock-matches.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, MatSort, MatSortHeader, DecimalPipe, PercentPipe, LoaderComponent, ErrorCardComponent, ChipsComponent, DeadlockLineChartComponent]
})
export class DeadlockMatchesComponent {
    private readonly matches = inject(MatchAnalyticsRepository);
    private readonly curves = inject(CurveAnalyticsRepository);
    private readonly compositionRepository = inject(CompositionAnalyticsRepository);

    readonly lead = deadlockResource(query => this.curves.getLead(query));
    readonly compositions = deadlockResource(query => this.compositionRepository.getCompositions(query));
    readonly objectives = deadlockResource(query => this.matches.getObjectives(query));
    readonly leavers = deadlockResource(query => this.matches.getLeavers(query));

    readonly formatPercent = formatPercent;

    /** Which time of the match the lead table breaks down; the chart shows all of them. */
    readonly leadView = signal<LeadView>('curve');
    readonly compositionSort = signal<Sort>({ active: 'games', direction: 'desc' });

    readonly leadOptions = computed<ChipOption<LeadView>[]>(() => [
        { value: 'curve', label: 'Overview' },
        ...(this.lead.value()?.minutes ?? []).map(point => ({ value: point.minute as LeadView, label: `${point.minute} min` }))
    ]);

    readonly leadSeries = computed<LineSeries[]>(() => {
        const minutes = this.lead.value()?.minutes ?? [];
        return [
            { label: 'Team ahead wins', color: SERIES_COLORS.winners, points: minutes.map(point => ({ x: point.minute, y: point.leaderWinRate })) },
            { label: 'Comeback', color: SERIES_COLORS.accent, points: minutes.map(point => ({ x: point.minute, y: point.comebackRate })) }
        ];
    });

    /** The lead sizes of the picked time of the match. */
    readonly leadBuckets = computed(() => {
        const view = this.leadView();
        return view === 'curve' ? [] : (this.lead.value()?.minutes.find(point => point.minute === view)?.buckets ?? []);
    });

    readonly compositionRows = computed<CompositionPoint[]>(() => sortRows(
        (this.compositions.value()?.compositions ?? []).slice(0, COMPOSITIONS_SHOWN * 4),
        this.compositionSort(),
        (row, key) => (row as unknown as Record<string, string | number>)[key]
    ).slice(0, COMPOSITIONS_SHOWN));

    readonly minuteLabel = (x: number): string => `${x}m`;
    readonly rateLabel = (y: number): string => `${Math.round(y * 100)}%`;

    /** A range of souls, such as `2,000 – 3,000` or `10,000+`. */
    leadRange(from: number, to: number | null): string {
        return to === null ? `${from.toLocaleString()}+` : `${from.toLocaleString()} – ${to.toLocaleString()}`;
    }

    /** How many brawlers, assassins, marksmen, mystics and supports. */
    composition(row: CompositionPoint): string {
        return `${row.brawlers} / ${row.assassins} / ${row.marksmen} / ${row.mystics} / ${row.supports}`;
    }
}
