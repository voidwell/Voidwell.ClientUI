import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { RankingsRepository } from '@core/api/ps2/rankings.repository';
import { getErrorMessage } from '@core/util/error-message';
import { RatingCharacter } from '@core/api/models/ps2/reference.model';
import { MatCard, MatCardContent, MatCardFooter } from '@angular/material/card';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { NgClass, DecimalPipe } from '@angular/common';
import { FactionColorPipe } from '../pipes/faction-color.pipe';
import { WorldNamePipe } from '../pipes/world-name.pipe';
import { PlayerRanksDataSource } from './player-ranks.data-source';

@Component({
    templateUrl: './player-ranks.component.html',
    styleUrls: ['./player-ranks.component.css'],
    imports: [MatCard, MatCardContent, MatCardFooter, LoaderComponent, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, RouterLink, NgClass, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, DecimalPipe, FactionColorPipe, WorldNamePipe]
})

export class PlayerRanksComponent implements OnInit {
    private rankingsRepository = inject(RankingsRepository);
    private cdr = inject(ChangeDetectorRef);

    isLoading: boolean;
    errorMessage: string = null;

    playerRankings: RatingCharacter[] = [];
    dataSource: PlayerRanksDataSource;

    ngOnInit() {
        this.isLoading = true;

        this.rankingsRepository.getPlayerRanks()
            .pipe(catchError(error => {
                this.errorMessage = getErrorMessage(error)
                return throwError(() => error);
            }))
            .pipe(finalize(() => {
                this.isLoading = false;
                this.cdr.markForCheck();
            }))
            .subscribe(data => {
                this.playerRankings = data;
                this.dataSource = new PlayerRanksDataSource(this.playerRankings);
            });
    }
}

