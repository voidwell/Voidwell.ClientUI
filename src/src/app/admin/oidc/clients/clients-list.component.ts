import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { Observable, BehaviorSubject, of, fromEvent, throwError } from 'rxjs';
import { distinctUntilChanged, debounceTime, catchError, finalize, tap } from 'rxjs/operators';
import { VoidwellApi } from './../../../shared/services/voidwell-api.service';
import { ClientConfig } from '../models/client.model';

@Component({
    templateUrl: './clients-list.template.html',
    styleUrls: ['./clients-list.styles.css']
})

export class ClientsListComponent implements OnInit, AfterViewInit {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild('filter') filter: ElementRef;

    dataSource: TableDataSource;

    constructor(private api: VoidwellApi, public dialog: MatDialog, private router: Router) {
    }

    ngOnInit() {
        this.dataSource = new TableDataSource(this.api);

        this.dataSource.loadClients('', 1);
    }

    ngAfterViewInit() {
        fromEvent(this.filter.nativeElement, 'keyup')
            .pipe(debounceTime(1000))
            .pipe(distinctUntilChanged())
            .subscribe(() => {
                this.paginator.pageIndex = 0;
                this.loadClientList();
            });

        this.paginator.page
            .pipe(
                tap(() => this.loadClientList())
            )
            .subscribe();
    }

    private loadClientList() {
        if (!this.dataSource) { return; }
        this.dataSource.loadClients(this.filter.nativeElement.value, this.paginator.pageIndex + 1);
    }

    createNewClient() {
        const dialogRef = this.dialog.open(ClientsListNewDialog, {});
    
        dialogRef.afterClosed().subscribe((result: DialogData) => {
            this.api.createClient(new ClientConfig(result))
                .pipe<any>(catchError(error => {
                    return throwError(error);
                }))
                .subscribe(client => {
                    this.router.navigateByUrl(`admin/oidc/clients/${client.clientId}`);
                }); 
        });
    }
}

export class TableDataSource extends DataSource<any> {
    private clientSubject = new BehaviorSubject<any[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public totalItems: number;
    public pageSize: number;

    constructor(private api: VoidwellApi) {
        super();
    }

    public loading$ = this.loadingSubject.asObservable();

    connect(): Observable<any[]> {
        return this.clientSubject.asObservable();
    }

    disconnect() {
        this.clientSubject.complete();
        this.loadingSubject.complete();
    }

    loadClients(filter = '', pageIndex = 1) {
        this.loadingSubject.next(true);

        this.api.getAllClients(filter, pageIndex)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe(results => {
                this.totalItems = results.totalCount;
                this.pageSize = results.pageSize;
                this.clientSubject.next(results.data)
            });
    }
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