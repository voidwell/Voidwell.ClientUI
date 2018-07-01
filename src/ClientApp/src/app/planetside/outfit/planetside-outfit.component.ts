import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataSource } from '@angular/cdk/collections';
import { MatSort, MatSortable } from '@angular/material';
import { Observable, Observer, Subscriber, Subscription, of, merge } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import { PlanetsideApi } from './../planetside-api.service';

@Component({
    selector: 'planetside-outfit',
    templateUrl: './planetside-outfit.template.html',
    styleUrls: ['./planetside-outfit.styles.css']
})

export class PlanetsideOutfitComponent implements OnDestroy {
    isLoading: boolean;
    errorMessage: string = null;
    public outfitData: any = null;

    private isLoadingMembers: boolean;
    private routeSub: Subscription;
    private members: any[];

    private sort: MatSort = new MatSort();
    private dataSource: TableDataSource;

    constructor(private api: PlanetsideApi, private route: ActivatedRoute, private router: Router) {
        this.routeSub = this.route.params.subscribe(params => {
            let id = params['id'];

            this.isLoading = true;
            this.isLoadingMembers = true;

            this.errorMessage = null;

            this.api.getOutfit(id)
                .pipe<any>(catchError(error => {
                    this.errorMessage = error._body
                    return Observable.throw(error);
                }))
                .pipe<any>(finalize(() => {
                    this.isLoading = false;
                }))
                .subscribe(data => {
                    this.outfitData = data;

                    let alias = data.alias ? '[' + data.alias + '] ' : '';
                });

            this.api.getOutfitMembers(id)
                .pipe<any>(catchError(error => {
                    this.errorMessage = error._body
                    return Observable.throw(error);
                }))
                .pipe<any>(finalize(() => {
                    this.isLoadingMembers = false;
                }))
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
    }
}

export class TableDataSource extends DataSource<any> {
    constructor(private data, private sort: MatSort) {
        super();
    }

    connect(): Observable<any[]> {
        let first = of(this.data);
        return merge(first, this.sort.sortChange).pipe(map(() => {
            return this.getSortedData();
        }));
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