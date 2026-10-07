import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable, BehaviorSubject, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SortValue } from '@shared/utils/sort';
import { CharacterLastSession } from '@core/api/models/ps2/admin.model';

export class PsbTableDataSource extends DataSource<CharacterLastSession> {
    constructor(public data: CharacterLastSession[], private sort: MatSort, private paginator: MatPaginator) {
        super();
    }

    _filterChange = new BehaviorSubject('');
    get filter(): string { return this._filterChange.value; }
    set filter(filter: string) { this._filterChange.next(filter); }

    connect(): Observable<CharacterLastSession[]> {
        const first = of(this.data);
        return merge(first, this.sort.sortChange, this.paginator.page, this._filterChange).pipe(map(() => {
            const data = this.data.slice();

            const sortedData = this.getSortedData(data);

            const filteredData = sortedData.filter(item => {
                const nameSearch = item.name.toLowerCase();
                const idSearch = item.characterId.toString();
                return nameSearch.indexOf(this.filter.toLowerCase()) != -1 || idSearch === this.filter;
            });

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            return filteredData.splice(startIndex, this.paginator.pageSize);
        }));
    }

    getSortedData(data: CharacterLastSession[]) {
        if (!data) {
            return null;
        }

        if (!this.sort.active || this.sort.direction == '') { return data; }

        return data.sort((a, b) => {
            let propertyA: SortValue;
            let propertyB: SortValue;

            switch (this.sort.active) {
                case 'name': [propertyA, propertyB] = [a.name, b.name]; break;
                case 'loginDate': [propertyA, propertyB] = [a.loginDate, b.loginDate]; break;
                case 'logoutDate': [propertyA, propertyB] = [a.logoutDate, b.logoutDate]; break;
                case 'duration': [propertyA, propertyB] = [a.duration, b.duration]; break;
            }

            const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            if (valueA == null) {
                return 1;
            } else if (valueB == null) {
                return -1;
            } else if (valueA === valueB) {
                return 0;
            }

            return ((valueA as number) < (valueB as number) ? -1 : 1) * (this.sort.direction == 'asc' ? 1 : -1);
        });
    }

    disconnect() { }
}
