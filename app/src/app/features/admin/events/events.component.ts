import { Component, ChangeDetectionStrategy, OnDestroy, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { CustomEvent } from '@core/api/models/platform/custom-event.model';
import { CustomEventRepository } from '@core/api/platform/custom-event.repository';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { EventsTableDataSource } from './events.data-source';
import { EventEditorDialog } from './event-editor-dialog/event-editor-dialog.component';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'voidwell-admin-events',
    templateUrl: './events.component.html',
    imports: [LoaderComponent, ErrorMessageComponent, MatButton, MatIcon, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, RouterLink, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, DatePipe]
})

export class EventsComponent implements OnDestroy {
    private customEventRepository = inject(CustomEventRepository);
    private dialog = inject(MatDialog);

    isLoading: boolean = true;
    errorMessage: string = null;
    getEventsRequest: Subscription;

    private events: CustomEvent[];
    private dataSource: EventsTableDataSource;

    constructor() {
        this.isLoading = true;

        this.getEventsRequest = this.customEventRepository.getEvents()
            .subscribe(events => {
                this.events = events;
                this.dataSource = new EventsTableDataSource(this.events);

                this.isLoading = false;
            });
    }

    onEdit(event: CustomEvent) {
        const dialogRef = this.dialog.open(EventEditorDialog, {
            data: { event: event }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!result) {
                return;
            }

            for (let i = 0; i < this.events.length; i++) {
                if (this.events[i].id == result.id) {
                    this.events[i] = result;
                    this.dataSource.refresh();
                    return;
                }
            }

            this.events.push(result);
            this.dataSource.refresh();
        });
    }

    ngOnDestroy() {
        if (this.getEventsRequest) {
            this.getEventsRequest.unsubscribe();
        }
    }
}

