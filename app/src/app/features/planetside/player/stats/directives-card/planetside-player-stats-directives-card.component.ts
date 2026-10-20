import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';
import { of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { CharacterDetails } from '@core/api/models/ps2/character.model';
import { CharacterRepository } from '@core/api/ps2/character.repository';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { DirectivesSummary, summarizeDirectives, treeProgress } from '../../directives/directive-progress';
import { DirectivesSummaryComponent } from '../../directives/directives-summary/directives-summary.component';

/** The player's directive progress at a glance, linking on to the Directives page. */
@Component({
    selector: 'planetside-player-stats-directives-card',
    templateUrl: './planetside-player-stats-directives-card.component.html',
    styleUrls: ['./planetside-player-stats-directives-card.component.css'],
    imports: [LoaderComponent, MatCard, MatCardTitle, MatCardContent, RouterLink, DirectivesSummaryComponent]
})
export class PlanetsidePlayerStatsDirectivesCardComponent {
    private characterRepository = inject(CharacterRepository);

    readonly player = input.required<CharacterDetails>();

    /** The summary; `undefined` while loading and `null` when the directives could not be loaded. */
    readonly summary = toSignal<DirectivesSummary | null | undefined>(toObservable(this.player).pipe(
        switchMap(player => this.characterRepository.getDirectives(player.id).pipe(
            map(outline => summarizeDirectives(outline.categories.flatMap(category => category.trees.map(treeProgress)))),
            catchError(() => of(null)),
            startWith(undefined)))));
}
