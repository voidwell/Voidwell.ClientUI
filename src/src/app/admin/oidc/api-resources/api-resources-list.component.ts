import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import { Observable, BehaviorSubject, of, fromEvent, throwError } from 'rxjs';
import { distinctUntilChanged, debounceTime, catchError, finalize, tap } from 'rxjs/operators';
import { VoidwellApi } from './../../../shared/services/voidwell-api.service';
import { ApiResourceConfig } from '../models/apiresource.model';

@Component({
    templateUrl: './api-resources-list.template.html',
    styleUrls: ['./api-resources-list.styles.css']
})

export class ApiResourcesListComponent implements OnInit, AfterViewInit {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild('filter') filter: ElementRef;

    dataSource: TableDataSource;

    constructor(private api: VoidwellApi, public dialog: MatDialog, private router: Router) {
    }

    ngOnInit() {
        this.dataSource = new TableDataSource(this.api);

        this.dataSource.loadResources('', 1);
    }

    ngAfterViewInit() {
        fromEvent(this.filter.nativeElement, 'keyup')
            .pipe(debounceTime(1000))
            .pipe(distinctUntilChanged())
            .subscribe(() => {
                this.paginator.pageIndex = 0;
                this.loadResourcesList();
            });

        this.paginator.page
            .pipe(
                tap(() => this.loadResourcesList())
            )
            .subscribe();
    }

    private loadResourcesList() {
        if (!this.dataSource) { return; }
        this.dataSource.loadResources(this.filter.nativeElement.value, this.paginator.pageIndex + 1);
    }

    createNewApiResource() {
        const dialogRef = this.dialog.open(ApiResourcesListNewDialog, {});
    
        dialogRef.afterClosed().subscribe((result: DialogData) => {
            this.api.createApiResource(new ApiResourceConfig(result))
                .pipe<any>(catchError(error => {
                    return throwError(error);
                }))
                .subscribe(resource => {
                    this.router.navigateByUrl(`admin/oidc/resources/${resource.name}`);
                }); 
        });
    }
}

export class TableDataSource extends DataSource<any> {
    private resourceSubject = new BehaviorSubject<any[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);

    public totalItems: number;
    public pageSize: number;

    constructor(private api: VoidwellApi) {
        super();
    }

    public loading$ = this.loadingSubject.asObservable();

    connect(): Observable<any[]> {
        return this.resourceSubject.asObservable();
    }

    disconnect() {
        this.resourceSubject.complete();
        this.loadingSubject.complete();
    }

    loadResources(filter = '', pageIndex = 1) {
        this.loadingSubject.next(true);

        this.api.getAllApiResources(filter, pageIndex)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe(results => {
                this.totalItems = results.totalCount;
                this.pageSize = results.pageSize;
                this.resourceSubject.next(results.data)
            });
    }
}

export class DialogData {
    name: string;
}

@Component({
    selector: 'api-resources-list-new-dialog',
    templateUrl: 'api-resources-list-new-dialog.html',
})
export class ApiResourcesListNewDialog {
    data: DialogData = new DialogData();

    constructor(
        public dialogRef: MatDialogRef<ApiResourcesListNewDialog>) {}

    onNoClick(): void {
        this.dialogRef.close();
    }
}