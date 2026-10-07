import { DataSource } from '@angular/cdk/collections';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomEvent } from '@core/api/models/platform/custom-event.model';

export class EventsTableDataSource extends DataSource<CustomEvent> {
    private dataSubject: BehaviorSubject<CustomEvent[]>;

    constructor(private data: CustomEvent[]) {
        super();

        this.dataSubject = new BehaviorSubject(this.data);
    }

    connect(): Observable<CustomEvent[]> {
        const first = this.dataSubject;
        return first.pipe(map(() => {
            return this.data.sort((a, b) => a.startDate < b.startDate ? 1 : -1);
        }));
    }

    refresh() {
        this.dataSubject.next(this.data);
    }

    disconnect() { }
}
