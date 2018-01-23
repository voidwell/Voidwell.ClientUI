import { Component, OnDestroy, Inject } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
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

    constructor(private api: VoidwellApi, private dialog: MatDialog) {
        this.isLoading = true;

        this.getEventsRequest = this.api.getCustomEvents()
            .subscribe(events => {
                this.dataSource = new TableDataSource(events);

                this.isLoading = false;
            });
    }

    onEdit(event: any) {
        let dialogRef = this.dialog.open(EventEditorDialog, {
            data: { event: event }
        });

        dialogRef.afterClosed().subscribe(result => {
            //Todo: save event after editing.
        });
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

@Component({
    selector: 'event-editor-dialog',
    templateUrl: 'event-editor-dialog.html',
})
export class EventEditorDialog {
    servers = [
        { id: "1", name: "Connery" },
        { id: "10", name: "Miller" },
        { id: "13", name: "Cobalt" },
        { id: "17", name: "Emerald" },
        { id: "19", name: "Jaeger" },
        { id: "25", name: "Briggs" }
    ];

    maps = [
        { id: "2", name: "Indar" },
        { id: "4", name: "Hossin" },
        { id: "6", name: "Amerish" },
        { id: "8", name: "Esamir" }
    ];

    constructor(
        public dialogRef: MatDialogRef<EventEditorDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

}