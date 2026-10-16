import { Component, computed, inject, signal } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlatformStoreUpdate } from '@core/api/models/ps2/admin.model';
import { StoreRepository } from '@core/api/ps2/store.repository';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { PlatformSectionComponent } from '@shared/ui/platform-section/platform-section.component';
import { groupByPlatform } from '@shared/utils/platforms';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatButton } from '@angular/material/button';
import { DatePipe } from '@angular/common';

/** A store of one Daybreak instance plus the UI state of its refresh button. */
type StoreRow = PlatformStoreUpdate & { isLoading?: boolean };

@Component({
    templateUrl: './stores.component.html',
    imports: [LoaderComponent, ErrorCardComponent, PlatformSectionComponent, MatFormField, MatInput, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatButton, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, DatePipe]
})

export class StoresComponent {
    private storeRepository = inject(StoreRepository);

    readonly columns = ['storeName', 'updateInterval', 'lastUpdated', 'refreshButton'];

    readonly isLoading = signal(true);
    readonly hasError = signal(false);
    readonly filter = signal('');

    private readonly stores = signal<StoreRow[]>([]);

    /** The stores matching the filter, split by platform. */
    readonly groups = computed(() => {
        const words = this.filter().toLowerCase().split(' ');

        return groupByPlatform(this.stores().filter(store => {
            const fields = [store.storeName.toLowerCase(), store.platform];
            return words.every(word => fields.some(field => field.includes(word)));
        }));
    });

    constructor() {
        this.storeRepository.getUpdateLog()
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: stores => this.stores.set(stores),
                error: () => this.hasError.set(true)
            });
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
            });
    }
}
