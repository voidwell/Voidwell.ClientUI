import { ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { fromEvent, throwError } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { StoreRepository } from '@core/api/ps2/store.repository';

import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatButton } from '@angular/material/button';
import { AsyncPipe, DatePipe } from '@angular/common';
import { StoreRow, StoresTableDataSource } from './stores.data-source';

@Component({
    templateUrl: './stores.component.html',
    imports: [LoaderComponent, ErrorMessageComponent, MatFormField, MatInput, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatButton, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, AsyncPipe, DatePipe]
})

export class StoresComponent implements OnInit {
    private storeRepository = inject(StoreRepository);
    private cdr = inject(ChangeDetectorRef);

    @ViewChild('filter', { static: true }) filter: ElementRef;
    
    dataSource: StoresTableDataSource;

    ngOnInit() {
        this.dataSource = new StoresTableDataSource(this.storeRepository);

        fromEvent(this.filter.nativeElement, 'keyup')
            .pipe(debounceTime(150))
            .pipe(distinctUntilChanged())
            .subscribe(() => {
                if (!this.dataSource) { return; }
                this.dataSource.filter = this.filter.nativeElement.value;
            });
    }

    onStoreRefresh(store: StoreRow) {
        store.isLoading = true;

        this.storeRepository.forceUpdate(store.storeName, store.platform)
            .pipe(catchError(error => {
                return throwError(() => error);
            }))
            .pipe(finalize(() => {
                store.isLoading = false;
                this.cdr.markForCheck();
            }))
            .subscribe(storeState => {
                Object.assign(store, storeState);
            });
    }
}

