import { Component } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlanetsidePlayerComponent } from './../planetside-player.component';
import { PlanetsideApi } from './../../shared/services/planetside-api.service';

@Component({
    templateUrl: './planetside-player-directives.template.html',
    styleUrls: ['./planetside-player-directives.styles.css']
})

export class PlanetsidePlayerDirectivesComponent {
    isLoading: boolean;
    errorMessage: string = null;

    private outline: any;
    private playerData: any;

    constructor(private planetsidePlayer: PlanetsidePlayerComponent, private api: PlanetsideApi) {
        this.isLoading = true;

        this.planetsidePlayer.playerData.subscribe(data => {
            this.isLoading = true;
            this.errorMessage = null;
            this.outline = [];
            this.playerData = data;

            if (this.playerData !== null) {
                this.api.getCharacterDirectives(this.playerData.id)
                    .pipe<any>(catchError(error => {
                        this.errorMessage = error._body
                        return throwError(error);
                    }))
                    .pipe<any>(finalize(() => {
                        this.isLoading = false;
                    }))
                    .subscribe(outline => {
                        this.outline = outline;
                    });
            }
        });
    }
}