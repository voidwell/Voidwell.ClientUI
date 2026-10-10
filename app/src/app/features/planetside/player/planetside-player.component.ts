import { Component, ChangeDetectionStrategy, inject, signal, effect, input, untracked } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CharacterRepository } from '@core/api/ps2/character.repository';
import { getErrorMessage } from '@core/util/error-message';
import { CharacterDetails } from '@core/api/models/ps2/character.model';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { CharacterCardComponent } from './character-card/character-card.component';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'planetside-player',
    templateUrl: './planetside-player.component.html',
    imports: [LoaderComponent, ErrorMessageComponent, CharacterCardComponent, RouterOutlet]
})

export class PlanetsidePlayerComponent {
    private characterRepository = inject(CharacterRepository);
    readonly id = input<string>();
    private router = inject(Router);

    isLoading: boolean;
    errorMessage: string = null;
    readonly playerData = signal<CharacterDetails | null>(null);


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
                        return throwError(() => error);
                    }))
                    .subscribe(data => {
                        this.playerData.set(data);
                        this.isLoading = false;
                    });
            });
        });
    }

}