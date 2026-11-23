import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DeadlockRankRepository } from '@core/api/deadlock/deadlock-reference.repository';
import { DeadlockMode } from '@core/api/models/deadlock/deadlock.model';
import { ChipOption, ChipsComponent } from '@shared/ui/vw-chips/vw-chips.component';
import { DeadlockFilterService, DeadlockPeriod, RANK_BRACKETS, RankBracket } from './data/deadlock-filter.service';

@Component({
    selector: 'voidwell-deadlock-wrapper',
    templateUrl: './deadlock-wrapper.component.html',
    imports: [RouterOutlet, ChipsComponent]
})
export class DeadlockWrapperComponent {
    private readonly rankRepository = inject(DeadlockRankRepository);
    private readonly ranks = rxResource({
        stream: () => this.rankRepository.getRanks().pipe(catchError(() => of([])))
    });

    readonly filter = inject(DeadlockFilterService);

    readonly modeOptions: ChipOption<DeadlockMode>[] = [
        { value: 'ranked', label: 'Ranked' },
        { value: 'unranked', label: 'Unranked' },
        { value: 'all', label: 'All' }
    ];

    readonly periodOptions: ChipOption<DeadlockPeriod>[] = [
        { value: '7', label: '7 days' },
        { value: '30', label: '30 days' },
        { value: '90', label: '90 days' },
        { value: 'patch', label: 'Latest patch' }
    ];

    /** Rank brackets, named after the ranks at their ends once those have loaded. */
    readonly bracketOptions = computed<ChipOption<RankBracket>[]>(() => {
        const names = new Map((this.ranks.value() ?? []).map(rank => [rank.tier, rank.name]));
        const bracket = (value: Exclude<RankBracket, 'all'>): ChipOption<RankBracket> => {
            const { minTier, maxTier } = RANK_BRACKETS[value];
            return { value, label: `${names.get(minTier) ?? `Tier ${minTier}`} – ${names.get(maxTier) ?? `Tier ${maxTier}`}` };
        };

        return [{ value: 'all', label: 'All ranks' }, bracket('low'), bracket('mid'), bracket('high')];
    });
}
