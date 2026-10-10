import { ChangeDetectorRef, Component, inject, effect, untracked } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlanetsidePlayerComponent } from '../planetside-player.component';
import { CharacterRepository } from '@core/api/ps2/character.repository';
import { getErrorMessage } from '@core/util/error-message';
import { CharacterDetails, CharacterDirectivesOutline } from '@core/api/models/ps2/character.model';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader } from '@angular/material/expansion';
import { DirectiveTreeListComponent } from './directive-tree-list/directive-tree-list.component';

@Component({
    templateUrl: './planetside-player-directives.component.html',
    styleUrls: ['./planetside-player-directives.component.css'],
    imports: [LoaderComponent, ErrorMessageComponent, MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, DirectiveTreeListComponent]
})

export class PlanetsidePlayerDirectivesComponent {
    private planetsidePlayer = inject(PlanetsidePlayerComponent);
    private characterRepository = inject(CharacterRepository);
    private cdr = inject(ChangeDetectorRef);

    isLoading: boolean;
    errorMessage: string = null;

    private outline: CharacterDirectivesOutline | null = null;
    private playerData: CharacterDetails;

    constructor() {
        this.isLoading = true;

        effect(() => {
            const data = this.planetsidePlayer.playerData();

            untracked(() => {
                this.isLoading = true;
                this.errorMessage = null;
                this.outline = null;
                this.playerData = data;

                if (this.playerData !== null) {
                    this.characterRepository.getDirectives(this.playerData.id)
                        .pipe(catchError(error => {
                            this.errorMessage = getErrorMessage(error)
                            return throwError(() => error);
                        }))
                        .pipe(finalize(() => {
                            this.isLoading = false;
                            this.cdr.markForCheck();
                        }))
                        .subscribe(outline => {
                            this.outline = outline;
                        });
                }
            });
        });
    }
}