import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AlertRepository } from '@core/api/ps2/alert.repository';
import { getErrorMessage } from '@core/util/error-message';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ActiveAlertsCardComponent } from '../../components/active-alerts-card/active-alerts-card.component';
import { AlertView, toAlertView } from '../../components/alert-view';
import { cellOf, sortRows } from '../../components/combat-report/combat-report-figures';
import { WorldService } from '../../data/world.service';
import { ZoneService } from '../../data/zone.service';
import { FactionCodePipe } from '../../pipes/faction-code.pipe';
import { activeAlerts, pastAlertRows } from './alerts-list-figures';

type Result = { alerts: AlertView[] } | { error: string };

@Component({
    templateUrl: './planetside-alerts-list.component.html',
    imports: [
        MatCard, MatCardTitle, MatCardContent, MatIcon, MatSort, MatSortHeader, RouterLink, DatePipe, DecimalPipe,
        LoaderComponent, ErrorCardComponent, ActiveAlertsCardComponent, FactionCodePipe
    ]
})
export class PlanetsideAlertsListComponent {
    private alertRepository = inject(AlertRepository);
    private zoneService = inject(ZoneService);
    readonly worldService = inject(WorldService);

    /** The page of past alerts being shown, from 0. */
    readonly page = signal(0);
    /** The server whose alerts are listed; everyone's when `null`. */
    readonly worldId = signal<number | null>(null);
    readonly sort = signal<Sort>({ active: 'startedAt', direction: 'desc' });
    /** Alerts whose hidden columns are showing on a phone. */
    readonly expanded = signal<ReadonlySet<string>>(new Set());

    private readonly result = signal<Result | null>(null);
    /** The newest alerts of every server, where the running ones come from; `null` until they load. */
    private readonly latest = signal<AlertView[] | null>(null);

    readonly isLoading = computed(() => this.result() === null);
    readonly errorMessage = computed(() => {
        const result = this.result();
        return result && 'error' in result ? result.error : null;
    });

    readonly active = computed(() => activeAlerts(this.latest() ?? []));
    readonly latestLoaded = computed(() => this.latest() !== null);

    readonly rows = computed(() => {
        const result = this.result();
        const worlds = this.worldService.worlds() ?? [];
        const rows = result && 'alerts' in result
            ? pastAlertRows(result.alerts, id => worlds.find(world => world.id === id)?.name ?? '', id => this.zoneService.zoneName(id) ?? '')
            : [];
        return sortRows(rows, this.sort(), cellOf);
    });

    constructor() {
        this.load();
    }

    setWorld(worldId: number | null): void {
        this.worldId.set(worldId);
        this.page.set(0);
        this.load();
    }

    goToPage(page: number): void {
        this.page.set(page);
        this.load();
    }

    onSort(sort: Sort): void {
        this.sort.set(sort);
    }

    toggle(key: string): void {
        this.expanded.update(open => {
            const next = new Set(open);
            if (!next.delete(key)) {
                next.add(key);
            }
            return next;
        });
    }

    private load(): void {
        this.result.set(null);

        const page = this.page();
        const worldId = this.worldId();

        this.alertRepository.getAlerts(page, worldId ?? undefined)
            .pipe(catchError(error => of({ error: getErrorMessage(error) })))
            .subscribe(alerts => {
                if (!Array.isArray(alerts)) {
                    this.latest.update(latest => latest ?? []);
                    this.result.set(alerts);
                    return;
                }

                const views = alerts.map(toAlertView);
                if (page === 0 && worldId === null) {
                    this.latest.set(views);
                } else if (this.latest() === null) {
                    this.latest.set([]);
                }
                this.result.set({ alerts: views });
            });
    }
}
