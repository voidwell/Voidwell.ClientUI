import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { Observable, BehaviorSubject, of, merge, fromEvent, throwError } from 'rxjs';
import { map, distinctUntilChanged, debounceTime, catchError, finalize } from 'rxjs/operators';
import { VoidwellApi } from './../../../shared/services/voidwell-api.service';
import { ClientConfig } from '../models/client.model';

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

    constructor(private api: VoidwellApi, public dialog: MatDialog, private router: Router) {
    }

    ngOnInit() {
        this.isLoading = true;
        this.errorMessage = null;

        this.dataSource = new TableDataSource(this.clients, this.paginator);

        this.api.getAllClients()
            .pipe<any>(catchError(error => {
                this.errorMessage = error._body
                return throwError(error);
            }))
            .pipe<any>(finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(clients => {
                this.clients = clients;
                this.dataSource = new TableDataSource(this.clients, this.paginator);
            });

        fromEvent(this.filter.nativeElement, 'keyup')
            .pipe(debounceTime(150))
            .pipe(distinctUntilChanged())
            .subscribe(() => {
                if (!this.dataSource) { return; }
                this.dataSource.filter = this.filter.nativeElement.value;
            });
    }

    createNewClient() {
        const dialogRef = this.dialog.open(ClientsListNewDialog, {});
    
        dialogRef.afterClosed().subscribe((result: DialogData) => {
            this.api.createClient(new ClientConfig(result))
                .pipe<any>(catchError(error => {
                    this.errorMessage = error._body
                    return throwError(error);
                }))
                .subscribe(client => {
                    this.router.navigateByUrl(`admin/oidc/clients/${client.clientId}`);
                }); 
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
        let first = of(this.data);
        return merge(first, this.paginator.page, this._filterChange).pipe(map(() => {
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
        }));
    }

    disconnect() { }
}

export class DialogData {
    clientId: string;
    clientName: string;
}

@Component({
    selector: 'clients-list-new-dialog',
    templateUrl: 'clients-list-new-dialog.html',
})
export class ClientsListNewDialog {
    data: DialogData = new DialogData();

    constructor(
        public dialogRef: MatDialogRef<ClientsListNewDialog>) {}

    onNoClick(): void {
        this.dialogRef.close();
    }
}