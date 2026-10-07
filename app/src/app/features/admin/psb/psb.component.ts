import { Component, ElementRef, ViewChild, OnInit, OnDestroy, inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable, MatSortHeader } from '@angular/material/sort';
import { Subscription, fromEvent, throwError } from 'rxjs';
import { debounceTime, distinctUntilChanged, catchError } from 'rxjs/operators';
import { CharacterLastSession } from '@core/api/models/ps2/admin.model';
import { PsbUtilityRepository } from '@core/api/ps2/psb-utility.repository';
import { getErrorMessage } from '@core/util/error-message';
import { MatButton } from '@angular/material/button';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { PsbTableDataSource } from './psb.data-source';

@Component({
    templateUrl: './psb.component.html',
    styleUrls: ['./psb.component.css'],
    imports: [MatButton, LoaderComponent, ErrorMessageComponent, MatFormField, MatInput, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef, MatCell, RouterLink, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatPaginator, DecimalPipe, DatePipe]
})

export class PsbComponent implements OnInit, OnDestroy {
    private psbUtilityRepository = inject(PsbUtilityRepository);

    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('filter', { static: true }) filter: ElementRef;

    errorMessage: string = null;
    sessions: CharacterLastSession[] = null;
    isLoading: boolean;
    getSessionsRequest: Subscription;

    dataSource: PsbTableDataSource;

    ngOnInit() {
        this.sort.sort(<MatSortable>{
            id: 'loginDate',
            start: 'desc'
        });

        this.dataSource = new PsbTableDataSource([], this.sort, this.paginator);

        fromEvent(this.filter.nativeElement, 'keyup')
            .pipe(debounceTime(150))
            .pipe(distinctUntilChanged())
            .subscribe(() => {
                if (!this.dataSource) { return; }
                this.dataSource.filter = this.filter.nativeElement.value;
            });
    }

    loadAccountSessions() {
        this.isLoading = true;

        this.getSessionsRequest = this.psbUtilityRepository.getLastOnlineSessions()
            .pipe(catchError(error => {
                this.errorMessage = getErrorMessage(error);
                this.isLoading = false;
                return throwError(() => error);
            }))
            .subscribe(sessions => {
                this.sessions = sessions;
                this.dataSource = new PsbTableDataSource(this.sessions, this.sort, this.paginator);
                this.isLoading = false;
            });
    }

    ngOnDestroy() {
        if (this.getSessionsRequest) {
            this.getSessionsRequest.unsubscribe();
        }
    }
}

