import { Component, ElementRef, ViewChild, Inject, OnInit, OnDestroy } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatSort, MatSortable, MatPaginator } from '@angular/material';
import { Subscription, Observable, BehaviorSubject, merge, fromEvent, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, map, catchError } from 'rxjs/operators';
import { VoidwellApi } from './../../shared/services/voidwell-api.service';

@Component({
    templateUrl: './psb.template.html',
    styleUrls: ['./psb.styles.css']
})

export class PsbComponent implements OnInit, OnDestroy {
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild('filter') filter: ElementRef;

    errorMessage: string = null;
    sessions: Array<any> = null;
    isLoading: boolean;
    getSessionsRequest: Subscription;

    dataSource: TableDataSource;

    constructor(private api: VoidwellApi) {
    }

    ngOnInit() {
        this.sort.sort(<MatSortable>{
            id: 'loginDate',
            start: 'desc'
        });

        this.dataSource = new TableDataSource([], this.sort, this.paginator);

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

        this.getSessionsRequest = this.api.getPSBAccountSessions()
            .pipe<any>(catchError(error => {
                this.errorMessage = error._body || error.statusText;
                this.isLoading = false;
                return Observable.throw(error);
            }))
            .subscribe(sessions => {
                this.sessions = sessions;
                this.dataSource = new TableDataSource(this.sessions, this.sort, this.paginator);
                this.isLoading = false;
            });
    }

    ngOnDestroy() {
        if (this.getSessionsRequest) {
            this.getSessionsRequest.unsubscribe();
        }
    }
}

export class TableDataSource extends DataSource<any> {
    constructor(public data, private sort: MatSort, private paginator: MatPaginator) {
        super();
    }

    _filterChange = new BehaviorSubject('');
    get filter(): string { return this._filterChange.value; }
    set filter(filter: string) { this._filterChange.next(filter); }

    connect(): Observable<any[]> {
        let first = of(this.data);
        return merge(first, this.sort.sortChange, this.paginator.page, this._filterChange).pipe(map(() => {
            const data = this.data.slice();

            let sortedData = this.getSortedData(data);

            let filteredData = sortedData.filter(item => {
                let nameSearch = item.name.toLowerCase();
                let idSearch = item.characterId.toString();
                return nameSearch.indexOf(this.filter.toLowerCase()) != -1 || idSearch === this.filter;
            });

            let startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            return filteredData.splice(startIndex, this.paginator.pageSize);
        }));
    }

    getSortedData(data: any) {
        if (!data) {
            return null;
        }

        if (!this.sort.active || this.sort.direction == '') { return data; }

        return data.sort((a, b) => {
            let propertyA: any;
            let propertyB: any;

            switch (this.sort.active) {
                case 'name': [propertyA, propertyB] = [a.name, b.name]; break;
                case 'loginDate': [propertyA, propertyB] = [a.loginDate, b.loginDate]; break;
                case 'logoutDate': [propertyA, propertyB] = [a.logoutDate, b.logoutDate]; break;
                case 'duration': [propertyA, propertyB] = [a.duration, b.duration]; break;
            }

            let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            if (valueA == null) {
                return 1;
            } else if (valueB == null) {
                return -1;
            } else if (valueA === valueB) {
                return 0;
            }

            return (valueA < valueB ? -1 : 1) * (this.sort.direction == 'asc' ? 1 : -1);
        });
    }

    disconnect() { }
}