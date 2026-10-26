import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { of } from 'rxjs';
import { catchError, filter, map, startWith, switchMap } from 'rxjs/operators';
import { CharacterRepository } from '@core/api/ps2/character.repository';
import { CharacterDetails, CharacterDirectivesOutline } from '@core/api/models/ps2/character.model';
import { getErrorMessage } from '@core/util/error-message';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { PlanetsidePlayerComponent } from '../planetside-player.component';
import { playerTrail } from '../player-breadcrumbs';
import { DirectiveTreeProgress, DirectiveTreeStatus, summarizeDirectives, treeProgress } from './directive-progress';
import { DirectivesSummaryComponent } from './directives-summary/directives-summary.component';
import { DirectiveTreeCardComponent } from './directive-tree-card/directive-tree-card.component';
import { DirectiveTreeDialog, DirectiveTreeDialogData } from './directive-tree-dialog/directive-tree-dialog.component';
import { ChipOption, ChipsComponent } from '@shared/ui/vw-chips/vw-chips.component';

type DirectivesResult = { outline: CharacterDirectivesOutline } | { error: string };

export type StatusFilter = DirectiveTreeStatus | 'all';

interface CategoryGroup {
    id: number;
    name: string;
    trees: DirectiveTreeProgress[];
}

@Component({
    templateUrl: './planetside-player-directives.component.html',
    styleUrls: ['./planetside-player-directives.component.css'],
    imports: [
        ChipsComponent, LoaderComponent,
        ErrorCardComponent,
        MatCard,
        MatCardContent,
        MatIcon,
        DirectiveTreeCardComponent,
        DirectivesSummaryComponent
    ]
})
export class PlanetsidePlayerDirectivesComponent {
    private characterRepository = inject(CharacterRepository);
    private dialog = inject(MatDialog);
    private planetsidePlayer = inject(PlanetsidePlayerComponent);

    private readonly result = toSignal(toObservable(this.planetsidePlayer.playerData).pipe(
        filter((player): player is CharacterDetails => !!player),
        switchMap(player => this.characterRepository.getDirectives(player.id).pipe(
            map((outline): DirectivesResult => ({ outline })),
            catchError(error => of<DirectivesResult>({ error: getErrorMessage(error) })),
            startWith(undefined)))));

    readonly errorMessage = computed(() => {
        const result = this.result();
        return result && 'error' in result ? result.error : null;
    });

    /** Every category with its trees' progress, in game order; `undefined` while loading. */
    readonly categories = computed<CategoryGroup[] | undefined>(() => {
        const result = this.result();
        if (!result || !('outline' in result)) {
            return undefined;
        }
        return result.outline.categories.map(category => ({
            id: category.id,
            name: category.name ?? '',
            trees: category.trees.map(treeProgress)
        }));
    });

    constructor() {
        this.planetsidePlayer.breadcrumbs.set(playerTrail({ label: 'Directives' }));
    }

    readonly category = signal<number | null>(null);
    readonly status = signal<StatusFilter>('all');
    readonly statusOptions: ChipOption<StatusFilter>[] = [
        { value: 'all', label: 'All' }, { value: 'inProgress', label: 'In progress' }, { value: 'mastered', label: 'Mastered' }, { value: 'notStarted', label: 'Not started' }
    ];
    readonly categoryOptions = computed<ChipOption<number | null>[]>(() => [
        { value: null, label: 'All' }, ...(this.categories() ?? []).map(group => ({ value: group.id, label: group.name }))
    ]);
    readonly search = signal('');

    private readonly allTrees = computed(() => (this.categories() ?? []).flatMap(category => category.trees));

    readonly summary = computed(() => summarizeDirectives(this.allTrees()));

    /** The categories and trees left after the filters; categories without a match are left out. */
    readonly groups = computed(() => {
        const category = this.category();
        const status = this.status();
        const search = this.search().trim().toLowerCase();

        return (this.categories() ?? [])
            .filter(group => category === null || group.id === category)
            .map(group => ({
                ...group,
                mastered: group.trees.filter(tree => tree.status === 'mastered').length,
                total: group.trees.length,
                trees: group.trees.filter(tree =>
                    (status === 'all' || tree.status === status) &&
                    (!search || (tree.tree.name ?? '').toLowerCase().includes(search)))
            }))
            .filter(group => group.trees.length > 0);
    });

    onSearch(event: Event): void {
        this.search.set((event.target as HTMLInputElement).value);
    }

    open(progress: DirectiveTreeProgress): void {
        this.dialog.open<DirectiveTreeDialog, DirectiveTreeDialogData>(DirectiveTreeDialog, {
            data: { progress },
            width: '760px',
            maxWidth: '95vw',
            autoFocus: 'dialog'
        });
    }
}
