import { Component, computed, input, signal } from '@angular/core';
import { DecimalPipe, NgClass, PercentPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { ItemSlot, ItemSummary } from '@core/api/models/deadlock/deadlock.model';
import { ChipOption, ChipsComponent } from '@shared/ui/vw-chips/vw-chips.component';
import { changeClass, formatMinutes, formatPercent, formatPoints, sortRows, titleCase } from '../../data/deadlock-figures';

const PAGE_SIZE = 50;

type SlotFilter = ItemSlot | 'all';

/** The value a table header sorts the items by. */
function itemSortValue(item: ItemSummary, key: string): string | number | null {
    return key === 'name' ? (item.name ?? '') : ((item as unknown as Record<string, string | number | null>)[key] ?? null);
}

/** Shop items with how often they are bought and how their buyers do, filterable by slot and name. */
@Component({
    selector: 'dl-items-table',
    templateUrl: './deadlock-items-table.component.html',
    imports: [DecimalPipe, PercentPipe, NgClass, MatIcon, MatSort, MatSortHeader, ChipsComponent]
})
export class DeadlockItemsTableComponent {
    readonly items = input.required<readonly ItemSummary[]>();
    /** Names what the win rate lift is measured against, shown as a hint under the table. */
    readonly liftBaseline = input('50%');

    readonly pageSize = PAGE_SIZE;
    readonly slot = signal<SlotFilter>('all');
    readonly search = signal('');
    readonly sort = signal<Sort>({ active: 'games', direction: 'desc' });
    readonly page = signal(0);
    readonly expanded = signal<ReadonlySet<number>>(new Set());

    readonly formatPoints = formatPoints;
    readonly formatPercent = formatPercent;
    readonly formatMinutes = formatMinutes;
    readonly changeClass = changeClass;
    readonly titleCase = titleCase;

    readonly slotOptions: ChipOption<SlotFilter>[] = [
        { value: 'all', label: 'All' },
        { value: 'weapon', label: 'Weapon' },
        { value: 'spirit', label: 'Spirit' },
        { value: 'vitality', label: 'Vitality' }
    ];

    private readonly filtered = computed(() => {
        const slot = this.slot();
        const term = this.search().trim().toLowerCase();
        const rows = this.items().filter(item => (slot === 'all' || item.slotType === slot) && (!term || (item.name ?? '').toLowerCase().includes(term)));
        return sortRows(rows, this.sort(), itemSortValue);
    });

    readonly count = computed(() => this.filtered().length);
    readonly pageRows = computed(() => this.filtered().slice(this.page() * PAGE_SIZE, (this.page() + 1) * PAGE_SIZE));
    readonly firstRow = computed(() => (this.pageRows().length ? this.page() * PAGE_SIZE + 1 : 0));
    readonly lastRow = computed(() => this.page() * PAGE_SIZE + this.pageRows().length);
    readonly hasNext = computed(() => this.lastRow() < this.count());

    onSlot(slot: SlotFilter): void {
        this.slot.set(slot);
        this.page.set(0);
    }

    onSearch(value: string): void {
        this.search.set(value);
        this.page.set(0);
    }

    onSort(sort: Sort): void {
        this.sort.set(sort);
        this.page.set(0);
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

    timing(item: ItemSummary): string {
        return item.timing.filter(point => point.games > 0).map(point => `${titleCase(point.bucket)} ${formatPercent(point.winRate)} (${formatPercent(point.share)} of buyers)`).join(' · ') || '—';
    }
}
