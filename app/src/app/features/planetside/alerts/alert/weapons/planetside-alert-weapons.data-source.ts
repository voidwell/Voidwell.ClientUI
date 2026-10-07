import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, of, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { compareSortValues, SortValue } from '@shared/utils/sort';
import { CombatReportWeaponStats } from '@core/api/models/ps2/combat-report.model';

export class AlertWeaponsDataSource extends DataSource<CombatReportWeaponStats> {
    constructor(public data: CombatReportWeaponStats[], private sort: MatSort, private paginator: MatPaginator) {
        super();
    }

    connect(): Observable<CombatReportWeaponStats[]> {
        const first = of(this.data);
        return merge(first, this.sort.sortChange, this.paginator.page).pipe(map(() => {
            const data = this.data.slice();

            const sortedData = this.getSortedData(data);

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            return sortedData.splice(startIndex, this.paginator.pageSize);
        }));
    }

    getSortedData(data: CombatReportWeaponStats[]) {
        if (!data) {
            return null;
        }

        if (!this.sort.active || this.sort.direction == '') { return data; }

        return data.sort((a, b) => {
            let propertyA: SortValue;
            let propertyB: SortValue;

            switch (this.sort.active) {
                case 'name': [propertyA, propertyB] = [a.item.name, b.item.name]; break;
                case 'kills': [propertyA, propertyB] = [a.kills, b.kills]; break;
                case 'tks': [propertyA, propertyB] = [a.teamkills, b.teamkills]; break;
                case 'headshots': [propertyA, propertyB] = [a.headshots, b.headshots]; break;
                case 'hsper': [propertyA, propertyB] = [(a.headshots / a.kills), (b.headshots / b.kills)]; break;
            }

            return compareSortValues(propertyA, propertyB, this.sort.direction);
        });
    }

    disconnect() { }
}
