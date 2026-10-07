import { Component, inject, effect, input, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatSort, MatSortable, MatSortHeader } from '@angular/material/sort';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { OutfitDetails, OutfitMemberDetails } from '@core/api/models/ps2/outfit.model';
import { OutfitRepository } from '@core/api/ps2/outfit.repository';
import { getErrorMessage } from '@core/util/error-message';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { OutfitCardComponent } from './outfit-card/outfit-card.component';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { DecimalPipe, DatePipe } from '@angular/common';
import { OutfitMembersDataSource } from './planetside-outfit.data-source';

@Component({
    selector: 'planetside-outfit',
    templateUrl: './planetside-outfit.component.html',
    styleUrls: ['./planetside-outfit.component.css'],
    imports: [LoaderComponent, ErrorMessageComponent, OutfitCardComponent, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef, MatCell, RouterLink, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, DecimalPipe, DatePipe]
})

export class PlanetsideOutfitComponent {
    private outfitRepository = inject(OutfitRepository);
    readonly id = input<string>();
    private router = inject(Router);

    isLoading: boolean;
    errorMessage: string = null;
    public outfitData: OutfitDetails = null;

    private isLoadingMembers: boolean;
    private members: OutfitMemberDetails[];

    private sort: MatSort = new MatSort();
    private dataSource: OutfitMembersDataSource;

    constructor() {
        effect(() => {
            const id = this.id();

            untracked(() => {

                this.isLoading = true;
                this.isLoadingMembers = true;

                this.errorMessage = null;

                this.outfitRepository.getOutfit(id)
                    .pipe(catchError(error => {
                        this.errorMessage = getErrorMessage(error)
                        return throwError(() => error);
                    }))
                    .pipe(finalize(() => {
                        this.isLoading = false;
                    }))
                    .subscribe(data => {
                        this.outfitData = data;
                    });

                this.outfitRepository.getMembers(id)
                    .pipe(catchError(error => {
                        this.errorMessage = getErrorMessage(error)
                        return throwError(() => error);
                    }))
                    .pipe(finalize(() => {
                        this.isLoadingMembers = false;
                    }))
                    .subscribe(data => {
                        this.members = data;

                        this.sort.sort(<MatSortable>{
                            id: 'rank',
                            start: 'desc'
                        });

                        this.dataSource = new OutfitMembersDataSource(data, this.sort);
                    });
            });
        });
    }

}

