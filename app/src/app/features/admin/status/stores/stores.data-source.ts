import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, merge, Observable, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { PlatformStoreUpdate } from '@core/api/models/ps2/admin.model';
import { StoreRepository } from '@core/api/ps2/store.repository';
import { getErrorMessage } from '@core/util/error-message';

/** A store of one Daybreak instance plus the UI state of its refresh button. */
export type StoreRow = PlatformStoreUpdate & { isLoading?: boolean };

export class StoresTableDataSource extends DataSource<StoreRow> {
    private loadingSubject = new BehaviorSubject<boolean>(true);
    private errorMessageSubject = new BehaviorSubject<string>(null);

    constructor(private storeRepository: StoreRepository) {
        super();
    }

    _dataChange = new BehaviorSubject<StoreRow[]>([]);
    get data(): StoreRow[] { return this._dataChange.value; }
    set data(data: StoreRow[]) { this._dataChange.next(data); }

    _filterChange = new BehaviorSubject('');
    get filter(): string { return this._filterChange.value; }
    set filter(filter: string) { this._filterChange.next(filter); }

    public loading$ = this.loadingSubject.asObservable();
    public errorMessage$ = this.errorMessageSubject.asObservable();

    connect(): Observable<StoreRow[]> {
        this.loadingSubject.next(true);
        this.errorMessageSubject.next(null);

        this.storeRepository.getUpdateLog()
            .pipe(
                catchError((error) => {
                    this.errorMessageSubject.next(getErrorMessage(error));
                    return throwError(() => error);
                }),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe(stores => {
                this.data = stores;
            });

        return merge(this._dataChange, this._filterChange).pipe(map(() => {
            return this.data.filter(d => {
                const filterStrings = this.filter.toLowerCase().split(" ");
                const matchStrings = [d.storeName.toLowerCase(), d.platform];

                return filterStrings.every(s => matchStrings.some(m => m.indexOf(s) != -1));
            });
        }));
    }

    disconnect() { }
}
