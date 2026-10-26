import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { PsbUtilityRepository } from '@core/api/ps2/psb-utility.repository';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { cellOf, sortRows } from '../../planetside/components/combat-report/combat-report-figures';
import { SessionRow, filterSessions, sessionRows } from '../admin-figures';

/** The accounts table's rows per page. */
export const ADMIN_PSB_PAGE_SIZE = 50;

@Component({
    templateUrl: './psb.component.html',
    styleUrls: ['./psb.component.css'],
    imports: [MatButton, MatIcon, MatCard, MatCardTitle, MatCardContent, MatSort, MatSortHeader, LoaderComponent, ErrorCardComponent, RouterLink, DecimalPipe, DatePipe]
})

export class PsbComponent {
    private psbUtilityRepository = inject(PsbUtilityRepository);

    readonly pageSize = ADMIN_PSB_PAGE_SIZE;
    readonly isLoading = signal(false);
    readonly hasError = signal(false);
    /** `null` until the accounts have been loaded. */
    private readonly sessions = signal<SessionRow[] | null>(null);
    readonly loaded = computed(() => this.sessions() !== null);

    readonly search = signal('');
    readonly sort = signal<Sort>({ active: 'login', direction: 'desc' });
    readonly page = signal(0);
    readonly expanded = signal<ReadonlySet<string>>(new Set());

    readonly total = computed(() => this.sessions()?.length ?? 0);
    private readonly filtered = computed(() => sortRows(filterSessions(this.sessions() ?? [], this.search()), this.sort(), cellOf));
    readonly filteredCount = computed(() => this.filtered().length);
    readonly pageRows = computed<SessionRow[]>(() => this.filtered().slice(this.page() * ADMIN_PSB_PAGE_SIZE, (this.page() + 1) * ADMIN_PSB_PAGE_SIZE));
    readonly firstRow = computed(() => (this.pageRows().length ? this.page() * ADMIN_PSB_PAGE_SIZE + 1 : 0));
    readonly lastRow = computed(() => this.page() * ADMIN_PSB_PAGE_SIZE + this.pageRows().length);
    readonly hasNext = computed(() => this.lastRow() < this.filteredCount());

    loadAccountSessions() {
        this.isLoading.set(true);
        this.hasError.set(false);

        this.psbUtilityRepository.getLastOnlineSessions().subscribe({
            next: sessions => {
                this.sessions.set(sessionRows(sessions || []));
                this.page.set(0);
                this.isLoading.set(false);
            },
            error: () => {
                this.hasError.set(true);
                this.isLoading.set(false);
            }
        });
    }

    onSearch(value: string) {
        this.search.set(value);
        this.page.set(0);
    }

    onSort(sort: Sort) {
        this.sort.set(sort);
        this.page.set(0);
    }

    goToPage(page: number) {
        this.page.set(page);
    }

    toggle(characterId: string) {
        this.expanded.update(open => {
            const next = new Set(open);
            if (!next.delete(characterId)) {
                next.add(characterId);
            }
            return next;
        });
    }
}
