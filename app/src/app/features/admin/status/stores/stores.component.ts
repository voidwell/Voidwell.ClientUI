import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { PlatformStoreUpdate } from '@core/api/models/ps2/admin.model';
import { StoreRepository } from '@core/api/ps2/store.repository';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { PlatformSectionComponent } from '@shared/ui/platform-section/platform-section.component';
import { groupByPlatform } from '@shared/utils/platforms';
import { SortCell, sortRows } from '../../../planetside/components/combat-report/combat-report-figures';
import { formatTimeSpan, parseTimeSpan } from '../../admin-figures';

/** A store of one Daybreak instance plus the UI state of its refresh button. */
type StoreRow = PlatformStoreUpdate & { isLoading?: boolean };

/** The most stores a list holds before it is given a filter box. */
export const STORES_FILTER_FROM = 10;

@Component({
    templateUrl: './stores.component.html',
    styleUrls: ['./stores.component.css'],
    imports: [LoaderComponent, ErrorCardComponent, PlatformSectionComponent, MatCard, MatIcon, MatSort, MatSortHeader, DatePipe]
})

export class StoresComponent {
    private storeRepository = inject(StoreRepository);

    readonly filterFrom = STORES_FILTER_FROM;
    readonly isLoading = signal(true);
    readonly hasError = signal(false);
    readonly filter = signal('');
    readonly sort = signal<Sort>({ active: 'storeName', direction: 'asc' });
    readonly expanded = signal<ReadonlySet<string>>(new Set());

    private readonly stores = signal<StoreRow[]>([]);
    readonly total = computed(() => this.stores().length);

    /** The stores matching the filter, split by platform and sorted. */
    readonly groups = computed(() => {
        const words = this.filter().toLowerCase().split(' ');

        const matching = this.stores().filter(store => {
            const fields = [(store.storeName ?? '').toLowerCase(), store.platform];
            return words.every(word => fields.some(field => field.includes(word)));
        });
        return groupByPlatform(matching).map(group => ({ ...group, items: sortRows(group.items, this.sort(), storeCell) }));
    });

    constructor() {
        this.storeRepository.getUpdateLog()
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: stores => this.stores.set(stores),
                error: () => this.hasError.set(true)
            });
    }

    interval(store: StoreRow): string {
        return formatTimeSpan(store.updateInterval);
    }

    key(store: StoreRow): string {
        return `${store.platform}/${store.storeName}`;
    }

    toggle(store: StoreRow) {
        this.expanded.update(open => {
            const next = new Set(open);
            const key = this.key(store);
            if (!next.delete(key)) {
                next.add(key);
            }
            return next;
        });
    }

    onSort(sort: Sort) {
        this.sort.set(sort);
    }

    onStoreRefresh(store: StoreRow) {
        store.isLoading = true;

        this.storeRepository.forceUpdate(store.storeName, store.platform)
            .pipe(
                catchError(error => throwError(() => error)),
                finalize(() => store.isLoading = false)
            )
            .subscribe(storeState => {
                Object.assign(store, storeState);
                this.stores.update(stores => [...stores]);
            });
    }
}

function storeCell(store: StoreRow, column: string): SortCell {
    switch (column) {
        case 'updateInterval': return parseTimeSpan(store.updateInterval);
        case 'lastUpdated': return store.lastUpdated ? Date.parse(store.lastUpdated) : null;
        default: return store.storeName;
    }
}
