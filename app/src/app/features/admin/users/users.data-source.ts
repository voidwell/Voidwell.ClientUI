import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { Observable, BehaviorSubject, of, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { SimpleUser } from '@core/api/models/auth/auth-admin.model';

export class UsersTableDataSource extends DataSource<SimpleUser> {
    constructor(public data: SimpleUser[], private paginator: MatPaginator) {
        super();
    }

    _filterChange = new BehaviorSubject('');
    get filter(): string { return this._filterChange.value; }
    set filter(filter: string) { this._filterChange.next(filter); }

    connect(): Observable<SimpleUser[]> {
        const first = of(this.data);
        return merge(first, this.paginator.page, this._filterChange).pipe(map(() => {
            if (this.data == null || this.data.length == 0) {
                return [];
            }

            const data = this.data.slice();

            const filteredData = data.filter(item => {
                const searchStr = item.userName.toLowerCase();
                return searchStr.indexOf(this.filter.toLowerCase()) != -1;
            });

            const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
            return filteredData.splice(startIndex, this.paginator.pageSize);
        }));
    }

    disconnect() { }
}
