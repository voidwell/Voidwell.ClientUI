import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { Observable, Subscription, of, merge, BehaviorSubject } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlanetsideApi } from './../shared/services/planetside-api.service';
import { PlanetsideItemComponent } from './planetside-item.component';

@Component({
    templateUrl: './planetside-item-leaderboard.template.html',
    styleUrls: ['./planetside-item-leaderboard.styles.css']
})

export class PlanetsideItemLeaderboardComponent implements OnInit {
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    errorMessage: string = null;
    weaponDataSub: Subscription;

    public dataSource: TableDataSource;

    constructor(private itemComponent: PlanetsideItemComponent, private api: PlanetsideApi) {
    }

    ngOnInit() {
        this.dataSource = new TableDataSource(this.api, this.paginator, this.itemComponent);
    }
}

export class TableDataSource extends DataSource<any> {
    private itemSubject = new BehaviorSubject<any[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(true);
    private itemId: string;

    constructor(private api: PlanetsideApi, private paginator: MatPaginator, private itemComponent: PlanetsideItemComponent) {
        super();
    }

    public loading$ = this.loadingSubject.asObservable();

    connect(): Observable<any[]> {
        merge(this.itemComponent.itemId, this.paginator.page).subscribe(() => {
            this.itemId = this.itemComponent.itemId.value;
            this.loadItems();
        })

        return this.itemSubject.asObservable();
    }

    disconnect() {
        this.itemSubject.complete();
        this.loadingSubject.complete();
    }

    loadItems() {
        if (this.itemId === '' || this.itemId === undefined) {
            return;
        }
        
        this.loadingSubject.next(true);

        this.api.getWeaponLeaderboard(this.itemId, this.paginator.pageIndex)
            .pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe(results => {
                this.itemSubject.next(results)
            });
    }
}