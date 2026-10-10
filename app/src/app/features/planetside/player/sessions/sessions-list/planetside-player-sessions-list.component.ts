import { Component, ChangeDetectionStrategy, inject, effect, untracked } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlanetsidePlayerComponent } from '../../planetside-player.component';
import { CharacterRepository } from '@core/api/ps2/character.repository';
import { getErrorMessage } from '@core/util/error-message';
import { CharacterDetails, PlayerSessionSummary } from '@core/api/models/ps2/character.model';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { DecimalPipe, DatePipe } from '@angular/common';
import { SessionsDataSource } from './planetside-player-sessions-list.data-source';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './planetside-player-sessions-list.component.html',
    styleUrls: ['./planetside-player-sessions-list.component.css'],
    imports: [LoaderComponent, ErrorMessageComponent, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatButton, RouterLink, MatIcon, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, DecimalPipe, DatePipe]
})

export class PlanetsidePlayerSessionsListComponent {
    private planetsidePlayer = inject(PlanetsidePlayerComponent);
    private characterRepository = inject(CharacterRepository);

    isLoading: boolean;
    errorMessage: string = null;

    private sessions: PlayerSessionSummary[];
    private playerData: CharacterDetails;

    private dataSource: DataSource<PlayerSessionSummary>;

    constructor() {
        this.isLoading = true;

        effect(() => {
            const data = this.planetsidePlayer.playerData();

            untracked(() => {
                this.isLoading = true;
                this.errorMessage = null;
                this.sessions = [];
                this.playerData = data;

                if (this.playerData !== null) {
                    this.characterRepository.getSessions(this.playerData.id)
                        .pipe(catchError(error => {
                            this.errorMessage = getErrorMessage(error)
                            return throwError(() => error);
                        }))
                        .pipe(finalize(() => {
                            this.isLoading = false;
                        }))
                        .subscribe(sessions => {
                            this.sessions = sessions.sort(this.sortSessions);
                            this.dataSource = new SessionsDataSource(this.sessions);
                        });
                }
            });
        });
    }

    private sortSessions(a: PlayerSessionSummary, b: PlayerSessionSummary) {
        if (a.loginDate < b.loginDate)
            return 1
        if (a.loginDate > b.loginDate)
            return -1;
        return 0;
    }
}

