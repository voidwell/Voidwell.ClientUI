import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CustomEventRepository } from '@core/api/platform/custom-event.repository';
import { CustomEvent } from '@core/api/models/platform/custom-event.model';
import { getErrorMessage } from '@core/util/error-message';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { cellOf, sortRows } from '../../components/combat-report/combat-report-figures';
import { WorldService } from '../../data/world.service';
import { ZoneService } from '../../data/zone.service';
import { ActiveEventsCardComponent } from '../active-events-card/active-events-card.component';

type Result = { events: CustomEvent[] } | { error: string };

/** A finished event as the list's table shows it. */
export interface PastEventRow {
    id: number;
    name: string;
    serverName: string;
    mapName: string;
    startDate: Date;
    startedAt: number;
    teams: string[];
}

@Component({
    templateUrl: './planetside-events-list.component.html',
    imports: [MatCard, MatCardTitle, MatCardContent, MatIcon, MatSort, MatSortHeader, RouterLink, DatePipe, LoaderComponent, ErrorCardComponent, ActiveEventsCardComponent]
})
export class PlanetsideEventsListComponent {
    private customEventRepository = inject(CustomEventRepository);
    private worldService = inject(WorldService);
    private zoneService = inject(ZoneService);

    readonly sort = signal<Sort>({ active: 'startedAt', direction: 'desc' });
    /** Events whose hidden columns are showing on a phone. */
    readonly expanded = signal<ReadonlySet<number>>(new Set());

    private readonly result = signal<Result | null>(null);

    readonly isLoading = computed(() => this.result() === null);
    readonly errorMessage = computed(() => {
        const result = this.result();
        return result && 'error' in result ? result.error : null;
    });
    private readonly events = computed(() => {
        const result = this.result();
        return result && 'events' in result ? result.events : [];
    });

    readonly active = computed(() => this.events().filter(event => new Date(event.endDate) > new Date()));

    readonly past = computed(() => {
        const worlds = this.worldService.worlds() ?? [];
        const rows = this.events()
            .filter(event => new Date(event.endDate) <= new Date())
            .map((event): PastEventRow => ({
                id: event.id,
                name: event.name,
                serverName: worlds.find(world => String(world.id) === event.serverId)?.name ?? '',
                mapName: event.mapId ? this.zoneService.zoneName(event.mapId) ?? '' : '',
                startDate: new Date(event.startDate),
                startedAt: new Date(event.startDate).getTime(),
                teams: [...(event.teams ?? [])].sort((a, b) => a.teamId.localeCompare(b.teamId)).map(team => team.name)
            }));
        return sortRows(rows, this.sort(), cellOf);
    });

    constructor() {
        this.customEventRepository.getEventsByGame('ps2')
            .pipe(catchError(error => of({ error: getErrorMessage(error) })))
            .subscribe(events => this.result.set(Array.isArray(events) ? { events } : events));
    }

    onSort(sort: Sort): void {
        this.sort.set(sort);
    }

    toggle(id: number): void {
        this.expanded.update(open => {
            const next = new Set(open);
            if (!next.delete(id)) {
                next.add(id);
            }
            return next;
        });
    }
}
