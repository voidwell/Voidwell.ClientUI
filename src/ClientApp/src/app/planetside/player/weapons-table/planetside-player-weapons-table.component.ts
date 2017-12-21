import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatSort, MatSortable } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/merge';

@Component({
    selector: 'planetside-player-weapons-table',
    templateUrl: './planetside-player-weapons-table.template.html',
    styleUrls: ['./planetside-player-weapons-table.styles.css']
})

export class PlanetsidePlayerWeaponsTableComponent implements OnInit {
    @ViewChild(MatSort) sort: MatSort;
    @Input() weapons: any;

    private dataSource: TableDataSource;

    ngOnInit() {
        this.sort.sort(<MatSortable>{
            id: 'kills',
            start: 'desc'
        });

        let weapons = this.weapons.filter(item => item.stats.kills > 0 && item.stats.playTime > 300);
        this.dataSource = new TableDataSource(weapons, this.sort);
    }

    private getPercentToAurax(kills: number) {
        let percent = kills / 1200 * 100;
        return (percent > 100 ? 100 : percent) + '%';
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
                case 'name': [propertyA, propertyB] = [a.name, b.name]; break;
                case 'kills': [propertyA, propertyB] = [a.stats.kills, b.stats.kills]; break;
                case 'vehicleKills': [propertyA, propertyB] = [a.stats.vehicleKills, b.stats.vehicleKills]; break;
                case 'deaths': [propertyA, propertyB] = [a.stats.deaths, b.stats.deaths]; break;
            }

            let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this.sort.direction == 'asc' ? 1 : -1);
        });
    }

    disconnect() { }
}