import { Component, OnDestroy } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { VoidwellApi } from '../shared/services/voidwell-api.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/finally'
import 'rxjs/add/observable/throw';

@Component({
    selector: 'voidwell-admin-events',
    templateUrl: './events.template.html'
})

export class EventsComponent implements OnDestroy {
    isLoading: boolean = true;
    errorMessage: string = null;
    getEventsRequest: Subscription;

    private dataSource: TableDataSource;

    constructor(private api: VoidwellApi) {
        this.isLoading = true;

        this.getEventsRequest = this.api.getCustomEvents()
            .subscribe(events => {
                this.dataSource = new TableDataSource(events);

                this.isLoading = false;
            });
    }

    onEdit(eventId: string) {
        console.log("edit event", eventId);
    }

    ngOnDestroy() {
        if (this.getEventsRequest) {
            this.getEventsRequest.unsubscribe();
        }
    }
}

export class TableDataSource extends DataSource<any> {
    constructor(private data) {
        super();
    }

    connect(): Observable<any[]> {
        let first = Observable.of(this.data);
        return Observable.merge(first).map(() => {
            const data = this.data.slice();

            return data;
        });
    }

    disconnect() { }
}