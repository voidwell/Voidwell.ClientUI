import { DataSource } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, Observable, throwError } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, map } from 'rxjs/operators';
import { VoidwellApi } from '../../../shared/services/voidwell-api.service';

@Component({
    templateUrl: './stores.template.html'
})

export class StoresComponent implements OnInit {
    @ViewChild('filter', { static: true }) filter: ElementRef;
    
    dataSource: TableDataSource;

    constructor(private api: VoidwellApi) {
    }

    ngOnInit() {
        this.dataSource = new TableDataSource(this.api);

        fromEvent(this.filter.nativeElement, 'keyup')
            .pipe(debounceTime(150))
            .pipe(distinctUntilChanged())
            .subscribe(() => {
                if (!this.dataSource) { return; }
                this.dataSource.filter = this.filter.nativeElement.value;
            });
    }

    onStoreRefresh(store: any) {
        store.isLoading = true;

        this.api.refreshPS2Store(store.storeName, store.originator)
            .pipe<any>(catchError(error => {
                return throwError(error);
            }))
            .pipe<any>(finalize(() => {
                store.isLoading = false;
            }))
            .subscribe(storeState => {
                Object.assign(store, storeState);
            });
    }
}

export class TableDataSource extends DataSource<any> {
    private loadingSubject = new BehaviorSubject<boolean>(true);
    private errorMessageSubject = new BehaviorSubject<string>(null);

    constructor(private api: VoidwellApi) {
        super();
    }

    _dataChange = new BehaviorSubject<any[]>([]);
    get data(): any[] { return this._dataChange.value; }
    set data(data: any[]) { this._dataChange.next(data); }

    _filterChange = new BehaviorSubject('');
    get filter(): string { return this._filterChange.value; }
    set filter(filter: string) { this._filterChange.next(filter); }

    public loading$ = this.loadingSubject.asObservable();
    public errorMessage$ = this.errorMessageSubject.asObservable();

    connect(): Observable<any[]> {
        this.loadingSubject.next(true);
        this.errorMessageSubject.next(null);

        this.api.getPS2StoreLogs()
            .pipe(
                catchError((error) => {
                    this.errorMessageSubject.next(error._body);
                    return throwError(error);
                }),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe(stores => {
                this.data = stores;
            });

        return merge(this._dataChange, this._filterChange).pipe(map(() => {
            return this.data.filter(d => {
                let filterStrings = this.filter.toLowerCase().split(" ");
                let matchStrings = [d.storeName.toLowerCase(), (d.originator || '').toLowerCase()];

                return filterStrings.every(s => matchStrings.some(m => m.indexOf(s) != -1));
            });
        }));
    }

    disconnect() { }
}