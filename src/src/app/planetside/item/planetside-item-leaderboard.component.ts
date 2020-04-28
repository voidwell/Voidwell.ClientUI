import { Component, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material';
import { Observable, Subscription, of, merge, BehaviorSubject } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlanetsideApi } from './../shared/services/planetside-api.service';
import { PlanetsideItemComponent } from './planetside-item.component';

@Component({
    templateUrl: './planetside-item-leaderboard.template.html',
    styleUrls: ['./planetside-item-leaderboard.styles.css']
})

export class PlanetsideItemLeaderboardComponent implements OnInit {
    @ViewChild(MatPaginator) paginator: MatPaginator;

    errorMessage: string = null;
    weaponDataSub: Subscription;

    public dataSource: TableDataSource;

    constructor(private itemComponent: PlanetsideItemComponent, private api: PlanetsideApi) {
    }

    ngOnInit() {
        this.dataSource = new TableDataSource(this.api, this.paginator, this.itemComponent.weaponData);
    }
}

export class TableDataSource extends DataSource<any> {
    private itemSubject = new BehaviorSubject<any[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    private itemId: string;

    constructor(private api: PlanetsideApi, private paginator: MatPaginator, private weaponId: Observable<any>) {
        super();
    }

    public loading$ = this.loadingSubject.asObservable();

    connect(): Observable<any[]> {
        merge(this.weaponId, this.paginator.page).subscribe((result) => {
            if (result && result.itemId) {
                this.itemId = result.itemId;
            }

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