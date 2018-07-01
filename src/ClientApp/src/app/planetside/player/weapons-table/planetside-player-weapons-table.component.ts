import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatSort, MatSortable } from '@angular/material';
import { Observable, of, merge } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'planetside-player-weapons-table',
    templateUrl: './planetside-player-weapons-table.template.html',
    styleUrls: ['./planetside-player-weapons-table.styles.css']
})

export class PlanetsidePlayerWeaponsTableComponent implements OnInit {
    @ViewChild(MatSort) sort: MatSort;
    @Input() weapons: any;

    dataSource: TableDataSource;

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
        let first = of(this.data);
        return merge(first, this.sort.sortChange).pipe(map(() => {
            return this.getSortedData();
        }));
    }

    getSortedData() {
        const data = this.data;
        if (!this.sort.active || this.sort.direction == '') { return data; }

        return data.sort((a, b) => {
            let f: (p: any) => any;

            switch (this.sort.active) {
                case 'name': f = p => p.name; break;
                case 'kills': f = p => p.stats.kills; break;
                case 'vehicleKills': f = p => p.stats.vehicleKills; break;
                case 'deaths': f = p => p.stats.deaths; break;
                case 'kdr': f = p => p.stats.kills / p.stats.deaths; break;
                case 'kdrDelta': f = p => p.stats.killDeathRatioDelta || -1000; break;
                case 'accuracy': f = p => p.stats.hitCount / p.stats.fireCount; break;
                case 'accuracyDelta': f = p => p.stats.accuracyDelta || -1000; break;
                case 'hsr': f = p => p.stats.headshots / p.stats.kills; break;
                case 'hsrDelta': f = p => p.stats.hsrDelta || -1000; break;
                case 'kph': f = p => p.stats.kills / (p.stats.playTime / 3600); break;
                case 'kphDelta': f = p => p.stats.kphDelta || -1000; break;
                case 'vehicleKph': f = p => p.stats.vehicleKills / (p.stats.playTime / 3600); break;
                case 'vehicleKphDelta': f = p => p.stats.vehicleKphDelta || -1000; break;
                case 'spm': f = p => p.stats.score / (p.stats.playTime / 60); break;
                case 'time': f = p => p.stats.playTime / 3600; break;
                case 'lpk': f = p => p.stats.hitCount / p.stats.kills; break;
                case 'spk': f = p => p.stats.fireCount / p.stats.kills; break;
            }

            let propertyA: any;
            let propertyB: any;
            [propertyA, propertyB] = [f(a), f(b)];

            let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this.sort.direction == 'asc' ? 1 : -1);
        });
    }

    disconnect() { }
}