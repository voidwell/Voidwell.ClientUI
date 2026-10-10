import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WorldOnlineState } from '@core/api/models/ps2/world-state.model';
import { WorldStateRepository } from '@core/api/ps2/world-state.repository';
import { getErrorMessage } from '@core/util/error-message';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { WorldCardComponent } from './world-card/world-card.component';
import { NgArrayPipesModule } from 'ngx-pipes';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './planetside-world-wrapper.component.html',
    styleUrls: ['./planetside-world-wrapper.component.css'],
    imports: [LoaderComponent, ErrorMessageComponent, WorldCardComponent, NgArrayPipesModule]
})

export class PlanetsideWorldWrapperComponent {
    private worldStateRepository = inject(WorldStateRepository);

    isLoading: boolean;
    errorMessage: string = null;
    worlds: WorldOnlineState[];

    constructor() {
        this.isLoading = true;
        this.errorMessage = null;

        this.worldStateRepository.getWorldStates()
            .pipe(catchError(error => {
                this.errorMessage = getErrorMessage(error)
                this.isLoading = false;
                return throwError(() => error);
            }))
            .subscribe(worlds => {
                this.worlds = worlds;
                this.isLoading = false;
            });
    }
}