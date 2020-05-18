import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import { Observable, BehaviorSubject, of, merge, fromEvent } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PlanetsideCombatEventComponent } from '../../../combat-event/planetside-combat-event.component';

@Component({
    templateUrl: './planetside-alert-players.template.html',
    styleUrls: ['./planetside-alert-players.styles.css']
})

export class PlanetsideAlertPlayersComponent implements OnInit {
    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
    @ViewChild('filter', { static: true }) filter: ElementRef;

    dataSource: TableDataSource;

    constructor(private parentEventComponent: PlanetsideCombatEventComponent) {
    }

    ngOnInit() {
        this.parentEventComponent.event.subscribe(alert => {
            if (alert == null) {
                return;
            }

            this.sort.sort(<MatSortable>{
                id: 'kills',
                start: 'desc'
            });

            this.dataSource = new TableDataSource(alert.log.stats.participants, this.sort, this.paginator);

            fromEvent(this.filter.nativeElement, 'keyup')
                .pipe(debounceTime(150))
                .pipe(distinctUntilChanged())
                .subscribe(() => {
                    if (!this.dataSource) { return; }
                    this.dataSource.filter = this.filter.nativeElement.value;
                });
        });
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
                let searchStr = item.character.name.toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) != -1;
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
                case 'name': [propertyA, propertyB] = [a.character.name, b.character.name]; break;
                case 'kills': [propertyA, propertyB] = [a.kills, b.kills]; break;
                case 'vehicleKills': [propertyA, propertyB] = [a.vehicleKills, b.vehicleKills]; break;
                case 'deaths': [propertyA, propertyB] = [a.deaths, b.deaths]; break;
                case 'kdr': [propertyA, propertyB] = [(a.kills / a.deaths), (b.kills / b.deaths)]; break;
                case 'tks': [propertyA, propertyB] = [a.teamkills, b.teamkills]; break;
                case 'suicides': [propertyA, propertyB] = [a.suicides, b.suicides]; break;
                case 'headshots': [propertyA, propertyB] = [a.headshots, b.headshots]; break;
                case 'hsper': [propertyA, propertyB] = [(a.headshots / a.kills), (b.headshots / b.kills)]; break;
            }

            let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this.sort.direction == 'asc' ? 1 : -1);
        });
    }

    disconnect() { }
}