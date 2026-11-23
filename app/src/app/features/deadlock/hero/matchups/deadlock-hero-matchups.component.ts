import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe, NgClass, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { HeroAnalyticsRepository } from '@core/api/deadlock/hero-analytics.repository';
import { PairSummary } from '@core/api/models/deadlock/deadlock.model';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ChipOption, ChipsComponent } from '@shared/ui/vw-chips/vw-chips.component';
import { changeClass, formatPercent, formatPoints, sortRows } from '../../data/deadlock-figures';
import { deadlockResource } from '../../data/deadlock-resource';
import { DeadlockHeroContext } from '../deadlock-hero-context.service';

type View = 'counters' | 'synergies' | 'lane';

const HINTS: Record<View, string> = {
    counters: 'How this hero does against each enemy hero. Advantage is the win rate less what the two heroes\' overall win rates alone would predict, so it shows the pairing and not just a strong hero.',
    synergies: 'How this hero does with each teammate hero. Advantage is the win rate less what the two heroes\' overall win rates alone would predict.',
    lane: 'How this hero does against each hero it meets in its lane. Lead is the average souls lead over the lane opponent at nine minutes, near the end of the laning phase.'
};

@Component({
    templateUrl: './deadlock-hero-matchups.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, MatSort, MatSortHeader, RouterLink, NgClass, DecimalPipe, PercentPipe, LoaderComponent, ErrorCardComponent, ChipsComponent]
})
export class DeadlockHeroMatchupsComponent {
    private readonly repository = inject(HeroAnalyticsRepository);
    private readonly hero = inject(DeadlockHeroContext);

    readonly view = signal<View>('counters');
    readonly sort = signal<Sort>({ active: 'advantage', direction: 'desc' });

    readonly viewOptions: ChipOption<View>[] = [
        { value: 'counters', label: 'Against' },
        { value: 'synergies', label: 'With' },
        { value: 'lane', label: 'In lane' }
    ];

    readonly pairs = deadlockResource((query, key: { id: number; view: View }) => {
        switch (key.view) {
            case 'synergies': return this.repository.getSynergies(key.id, query);
            case 'lane': return this.repository.getLane(key.id, query);
            default: return this.repository.getCounters(key.id, query);
        }
    }, () => {
        const id = this.hero.heroId();
        return id === undefined ? undefined : { id, view: this.view() };
    });

    readonly hint = computed(() => HINTS[this.view()]);

    readonly rows = computed<PairSummary[]>(() => sortRows(this.pairs.value()?.heroes ?? [], this.sort(), (row, key) =>
        key === 'name' ? (row.name ?? '') : ((row as unknown as Record<string, number | null>)[key] ?? null)));

    readonly formatPoints = formatPoints;
    readonly formatPercent = formatPercent;
    readonly changeClass = changeClass;

    /** A souls lead, with its sign. */
    lead(value: number | null): string {
        return value === null ? '—' : `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.round(Math.abs(value)).toLocaleString()}`;
    }
}
