import { DataSource } from '@angular/cdk/collections';
import { Observable, of, BehaviorSubject, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { CaptureLogRow } from '@core/api/models/ps2/combat-report.model';

/** Which kinds of map events the alert timeline lists. */
export interface CaptureFilter {
    captures: boolean;
    defends: boolean;
}

export class AlertMapDataSource extends DataSource<CaptureLogRow> {
    constructor(private data: CaptureLogRow[]) {
        super();
    }

    _filterChange = new BehaviorSubject<CaptureFilter | null>(null);
    get filter(): CaptureFilter | null { return this._filterChange.value; }
    set filter(filter: CaptureFilter | null) { this._filterChange.next(filter); }

    connect(): Observable<CaptureLogRow[]> {
        const first = of(this.data);
        return merge(first, this._filterChange).pipe(map(() => {
            const data = this.data.slice();

            if (!this.filter) {
                return data;
            }

            const filteredData = data.filter(item => {
                return (this.filter.captures && item.newFactionId !== item.oldFactionId) || (this.filter.defends && item.newFactionId === item.oldFactionId)
            });

            return filteredData;
        }));
    }

    disconnect() { }
}
