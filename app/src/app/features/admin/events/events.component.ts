import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { CustomEvent } from '@core/api/models/platform/custom-event.model';
import { CustomEventRepository } from '@core/api/platform/custom-event.repository';
import { WorldRepository } from '@core/api/ps2/world.repository';
import { ZoneRepository } from '@core/api/ps2/zone.repository';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { cellOf, sortRows } from '../../planetside/components/combat-report/combat-report-figures';
import { EventRow, eventRows } from '../admin-figures';
import { EventEditorDialog } from './event-editor-dialog/event-editor-dialog.component';

type Names = Record<string, string | undefined>;

@Component({
    selector: 'voidwell-admin-events',
    templateUrl: './events.component.html',
    styleUrls: ['./events.component.css'],
    imports: [LoaderComponent, ErrorCardComponent, MatButton, MatIcon, MatCard, MatCardTitle, MatCardContent, MatSort, MatSortHeader, RouterLink, DatePipe]
})

export class EventsComponent {
    private customEventRepository = inject(CustomEventRepository);
    private dialog = inject(MatDialog);

    /** World names keyed by world id. */
    private readonly worldNames = toSignal(
        inject(WorldRepository).getWorlds().pipe(
            map(worlds => Object.fromEntries(worlds.map(world => [world.id.toString(), world.name])) as Names),
            catchError(() => of({} as Names))),
        { initialValue: {} as Names });

    /** Zone names keyed by zone id. */
    private readonly zoneNames = toSignal(
        inject(ZoneRepository).getZones().pipe(
            map(zones => Object.fromEntries(zones.map(zone => [zone.id.toString(), zone.name])) as Names),
            catchError(() => of({} as Names))),
        { initialValue: {} as Names });

    readonly isLoading = signal(true);
    readonly hasError = signal(false);
    readonly sort = signal<Sort>({ active: 'start', direction: 'desc' });
    readonly expanded = signal<ReadonlySet<number>>(new Set());

    private readonly events = signal<CustomEvent[]>([]);
    readonly rows = computed<EventRow[]>(() => sortRows(eventRows(this.events(), this.worldNames(), this.zoneNames()), this.sort(), cellOf));

    constructor() {
        this.customEventRepository.getEvents().subscribe({
            next: events => {
                this.events.set(events || []);
                this.isLoading.set(false);
            },
            error: () => {
                this.hasError.set(true);
                this.isLoading.set(false);
            }
        });
    }

    onEdit(event: CustomEvent | null) {
        const dialogRef = this.dialog.open(EventEditorDialog, {
            data: { event }
        });

        dialogRef.afterClosed().subscribe((result: CustomEvent | undefined) => {
            if (!result) {
                return;
            }

            this.events.update(events => {
                const idx = events.findIndex(e => e.id === result.id);
                if (idx < 0) {
                    return [...events, result];
                }
                const next = [...events];
                next[idx] = result;
                return next;
            });
        });
    }

    onSort(sort: Sort) {
        this.sort.set(sort);
    }

    toggle(id: number) {
        this.expanded.update(open => {
            const next = new Set(open);
            if (!next.delete(id)) {
                next.add(id);
            }
            return next;
        });
    }
}
