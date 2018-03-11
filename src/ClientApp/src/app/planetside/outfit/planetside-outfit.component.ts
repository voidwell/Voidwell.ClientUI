import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataSource } from '@angular/cdk/collections';
import { MatSort, MatSortable } from '@angular/material';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';
import { PlanetsideApi } from './../planetside-api.service';
import { HeaderService, HeaderConfig, HeaderInfoItem } from './../../shared/services/header.service';
import { Observable } from 'rxjs/Observable';
import { Observer } from "rxjs/Observer";
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/finally'
import 'rxjs/add/observable/throw';
import { Subscriber } from "rxjs/Subscriber";

@Component({
    selector: 'planetside-outfit',
    templateUrl: './planetside-outfit.template.html',
    styleUrls: ['./planetside-outfit.styles.css']
})

export class PlanetsideOutfitComponent implements OnDestroy {
    isLoading: boolean;
    errorMessage: string = null;

    private isLoadingMembers: boolean;
    private routeSub: Subscription;
    private outfitData: any = null;
    private members: any[];

    private sort: MatSort = new MatSort();
    private dataSource: TableDataSource;

    constructor(private api: PlanetsideApi, private route: ActivatedRoute, private router: Router, private headerService: HeaderService, private datePipe: DatePipe) {
        this.routeSub = this.route.params.subscribe(params => {
            let id = params['id'];

            this.isLoading = true;
            this.isLoadingMembers = true;

            this.errorMessage = null;

            this.api.getOutfit(id)
                .catch(error => {
                    this.errorMessage = error._body
                    return Observable.throw(error);
                })
                .finally(() => {
                    this.isLoading = false;
                })
                .subscribe(data => {
                    this.outfitData = data;

                    let alias = data.alias ? '[' + data.alias + '] ' : '';

                    let headerConfig = new HeaderConfig();
                    headerConfig.title = alias + data.name;
                    headerConfig.subtitle = data.worldName;

                    if (data.factionId === 1) {
                        headerConfig.background = '#321147';
                    } else if (data.factionId === 2) {
                        headerConfig.background = '#112447';
                    } else if (data.factionId === 3) {
                        headerConfig.background = '#471111';
                    }

                    let createdDate = this.datePipe.transform(data.createdDate, 'MMM d, y');

                    headerConfig.info = [
                        new HeaderInfoItem('Members', data.memberCount),
                        new HeaderInfoItem('Created', createdDate),
                        new HeaderInfoItem('Leader', data.leaderName)
                    ];

                    this.headerService.setHeaderConfig(headerConfig);
                });

            this.api.getOutfitMembers(id)
                .catch(error => {
                    this.errorMessage = error._body
                    return Observable.throw(error);
                })
                .finally(() => {
                    this.isLoadingMembers = false;
                })
                .subscribe(data => {
                    this.members = data;

                    this.sort.sort(<MatSortable>{
                        id: 'rank',
                        start: 'desc'
                    });

                    this.dataSource = new TableDataSource(data, this.sort);
                });
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
        this.headerService.reset();
    }
}

export class TableDataSource extends DataSource<any> {
    constructor(private data, private sort: MatSort) {
        super();
    }

    connect(): Observable<any[]> {
        let first = Observable.of(this.data);
        return Observable.merge(first, this.sort.sortChange).map(() => {
            return this.getSortedData();
        });
    }

    getSortedData() {
        const data = this.data;
        if (!this.sort.active || this.sort.direction == '') { return data; }

        return data.sort((a, b) => {
            let propertyA: any;
            let propertyB: any;

            switch (this.sort.active) {
                case 'rank': [propertyA, propertyB] = [a.rankOrdinal, b.rankOrdinal]; break;
            }

            let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this.sort.direction == 'asc' ? 1 : -1);
        });
    }

    disconnect() { }
}