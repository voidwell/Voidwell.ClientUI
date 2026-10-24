import { ChangeDetectorRef, Component, computed, inject, signal, effect, input, untracked } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CharacterRepository } from '@core/api/ps2/character.repository';
import { getErrorMessage } from '@core/util/error-message';
import { CharacterDetails } from '@core/api/models/ps2/character.model';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { Breadcrumb, BreadcrumbsComponent } from '@shared/ui/vw-breadcrumbs/vw-breadcrumbs.component';
import { PlanetsidePlayerQuickStatsCardComponent } from './quick-stats-card/planetside-player-quick-stats-card.component';
import { CharacterCardComponent } from './character-card/character-card.component';
import { PlayerBreadcrumb } from './player-breadcrumbs';

@Component({
    selector: 'planetside-player',
    templateUrl: './planetside-player.component.html',
    imports: [ErrorCardComponent, BreadcrumbsComponent, CharacterCardComponent, PlanetsidePlayerQuickStatsCardComponent, RouterOutlet]
})

export class PlanetsidePlayerComponent {
    private characterRepository = inject(CharacterRepository);
    readonly id = input<string>();
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);

    isLoading: boolean;
    errorMessage: string = null;
    readonly playerData = signal<CharacterDetails | null>(null);
    /** Where the current page sits under the player, shown above the character card; each page sets its own. */
    readonly breadcrumbs = signal<PlayerBreadcrumb[]>([]);

    /** The trail, linked to the player's pages. */
    readonly crumbs = computed<Breadcrumb[]>(() => {
        const id = this.playerData()?.id;
        return this.breadcrumbs().map(crumb => ({
            label: crumb.label,
            link: crumb.path ? `/ps2/player/${id}/${crumb.path}` : undefined
        }));
    });


    constructor() {
        effect(() => {
            const id = this.id();

            untracked(() => {
                this.isLoading = true;
                this.errorMessage = null;

                this.playerData.set(null);

                this.characterRepository.getCharacter(id)
                    .pipe(catchError(error => {
                        this.errorMessage = getErrorMessage(error)
                        this.isLoading = false;
                        this.cdr.markForCheck();
                        return throwError(() => error);
                    }))
                    .subscribe(data => {
                        this.playerData.set(data);
                        this.isLoading = false;
                        this.cdr.markForCheck();
                    });
            });
        });
    }

}