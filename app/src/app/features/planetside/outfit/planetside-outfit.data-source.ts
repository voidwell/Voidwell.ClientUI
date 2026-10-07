import { DataSource } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { Observable, of, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { OutfitMemberDetails } from '@core/api/models/ps2/outfit.model';
import { compareSortValues, SortValue } from '@shared/utils/sort';

export class OutfitMembersDataSource extends DataSource<OutfitMemberDetails> {
    constructor(private data: OutfitMemberDetails[], private sort: MatSort) {
        super();
    }

    connect(): Observable<OutfitMemberDetails[]> {
        const first = of(this.data);
        return merge(first, this.sort.sortChange).pipe(map(() => {
            return this.getSortedData();
        }));
    }

    getSortedData() {
        const data = this.data;
        if (!this.sort.active || this.sort.direction == '') { return data; }

        return data.sort((a, b) => {
            let propertyA: SortValue;
            let propertyB: SortValue;

            switch (this.sort.active) {
                case 'rank': [propertyA, propertyB] = [a.rankOrdinal, b.rankOrdinal]; break;
            }

            return compareSortValues(propertyA, propertyB, this.sort.direction);
        });
    }

    disconnect() { }
}
