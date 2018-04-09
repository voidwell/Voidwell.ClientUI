import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/finally'
import 'rxjs/add/observable/throw';
import { VoidwellApi } from './../../../shared/services/voidwell-api.service';

@Component({
    templateUrl: './clients-list.template.html',
    styleUrls: ['./clients-list.styles.css']
})

export class ClientsListComponent implements OnInit {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild('filter') filter: ElementRef;

    isLoading: boolean;
    errorMessage: string;
    clients: any[] = [];

    dataSource: TableDataSource;

    constructor(private api: VoidwellApi) {
    }

    ngOnInit() {
        this.isLoading = true;
        this.errorMessage = null;

        this.dataSource = new TableDataSource(this.clients, this.paginator);

        this.api.getAllClients()
            .catch(error => {
                this.errorMessage = error._body
                return Observable.throw(error);
            })
            .finally(() => {
                this.isLoading = false;
            })
            .subscribe(clients => {
                this.clients = clients;
                this.dataSource = new TableDataSource(this.clients, this.paginator);
            });

        Observable.fromEvent(this.filter.nativeElement, 'keyup')
            .debounceTime(150)
            .distinctUntilChanged()
            .subscribe(() => {
                if (!this.dataSource) { return; }
                this.dataSource.filter = this.filter.nativeElement.value;
            });
    }
}

export class TableDataSource extends DataSource<any> {
    constructor(public data, private paginator: MatPaginator) {
        super();
    }

    _filterChange = new BehaviorSubject('');
    get filter(): string { return this._filterChange.value; }
    set filter(filter: string) { this._filterChange.next(filter); }

    connect(): Observable<any[]> {
        let first = Observable.of(this.data);
        return Observable.merge(first, this.paginator.page, this._filterChange).map(() => {
            if (this.data == null || this.data.length == 0) {
                return [];
            }

            const data = this.data.slice();

            let filteredData = data.filter(item => {
                let searchStr = item.clientId.toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) != -1;
            });

            let startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            return filteredData.splice(startIndex, this.paginator.pageSize);
        });
    }

    disconnect() { }
}