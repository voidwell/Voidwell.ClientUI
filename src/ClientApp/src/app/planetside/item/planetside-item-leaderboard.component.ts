import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { DataSource } from '@angular/cdk/collections';
import { MatSort, MatSortable, MatPaginator } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/fromEvent';
import { PlanetsideApi } from './../planetside-api.service';
import { PlanetsideItemComponent } from './planetside-item.component';

@Component({
    templateUrl: './planetside-item-leaderboard.template.html',
    styleUrls: ['./planetside-item-leaderboard.styles.css']
})

export class PlanetsideItemLeaderboardComponent implements OnInit, OnDestroy {
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatPaginator) paginator: MatPaginator;

    weaponDataSub: Subscription;
    isLoading: boolean = true;
    leaderboard: any[] = [];

    private dataSource: TableDataSource;

    constructor(private itemComponent: PlanetsideItemComponent, private api: PlanetsideApi) {
        
    }

    ngOnInit() {
        this.isLoading = true;

        this.sort.sort(<MatSortable>{
            id: 'kills',
            start: 'desc'
        });

        this.dataSource = new TableDataSource(this.leaderboard, this.sort, this.paginator);

        this.weaponDataSub = this.itemComponent.weaponData.subscribe(data => {
            this.isLoading = true;
            if (data) {
                this.api.getWeaponLeaderboard(data.itemId).subscribe(leaderboard => {
                    this.leaderboard = leaderboard;
                    this.dataSource = new TableDataSource(this.leaderboard, this.sort, this.paginator);

                    this.isLoading = false;
                });
            }
        });
    }

    ngOnDestroy() {
        this.weaponDataSub.unsubscribe();
    }
}

export class TableDataSource extends DataSource<any> {
    constructor(private data, private sort: MatSort, private paginator: MatPaginator) {
        super();
    }

    connect(): Observable<any[]> {
        let first = Observable.of(this.data);
        return Observable.merge(first, this.sort.sortChange, this.paginator.page).map(() => {
            if (this.data == null || this.data.length == 0) {
                return [];
            }

            const data = this.data.slice();

            let sortedData = this.getSortedData(data);

            let startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            return sortedData.splice(startIndex, this.paginator.pageSize);
        });
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
                case 'kills': [propertyA, propertyB] = [a.kills, b.kills]; break;
                case 'vehicleKills': [propertyA, propertyB] = [a.vehicleKills, b.vehicleKills]; break;
                case 'deaths': [propertyA, propertyB] = [a.deaths, b.deaths]; break;
                case 'kdr': [propertyA, propertyB] = [(a.kills / a.deaths), (b.kills / b.deaths)]; break;
                case 'kdrDelta': [propertyA, propertyB] = [a.kdrDelta, b.kdrDelta]; break;
                case 'aga': [propertyA, propertyB] = [a.aga, b.aga]; break;
                case 'accuracy': [propertyA, propertyB] = [(a.shotsHit / a.shotsFired), (b.shotsHit / b.shotsFired)]; break;
                case 'accuracyDelta': [propertyA, propertyB] = [a.accuracyDelta, b.accuracyDelta]; break;
            }

            let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this.sort.direction == 'asc' ? 1 : -1);
        });
    }

    disconnect() { }
}