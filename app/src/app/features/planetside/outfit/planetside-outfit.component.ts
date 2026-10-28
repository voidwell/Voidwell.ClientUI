import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe, PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { MatIcon } from '@angular/material/icon';
import { of } from 'rxjs';
import { catchError, filter, map, startWith, switchMap } from 'rxjs/operators';
import { OutfitDetails, OutfitMemberDetails } from '@core/api/models/ps2/outfit.model';
import { OutfitRepository } from '@core/api/ps2/outfit.repository';
import { getErrorMessage } from '@core/util/error-message';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { sortRows } from '../components/combat-report/combat-report-figures';
import { OutfitCardComponent } from './outfit-card/outfit-card.component';
import { accuracy, hsr, isWithin, kdr, mean, median, siege, spm, timeAgo } from './outfit-figures';
import { ChipOption, ChipsComponent } from '@shared/ui/vw-chips/vw-chips.component';

/** The roster's rows per page. */
export const ROSTER_PAGE_SIZE = 25;

export type RosterFilter = 'all' | 'active7' | 'active30' | 'untracked';

type Result<T> = { data: T } | { error: string };

/** A member's figure for a sortable column; missing figures sort last. */
const sortValue = (member: OutfitMemberDetails, column: string): string | number | null => {
    switch (column) {
        case 'name': return member.name ?? null;
        case 'rank': return member.rankOrdinal;
        case 'battleRank': return member.battleRank ?? null;
        case 'kdr': return kdr(member);
        case 'accuracy': return accuracy(member);
        case 'hsr': return hsr(member);
        case 'siege': return siege(member);
        case 'score': return member.lifetimeStats?.weaponScore ?? null;
        case 'spm': return spm(member);
        case 'memberSinceDate': return Date.parse(member.memberSinceDate) || null;
        case 'lastLogin': return member.lastLoginDate ? Date.parse(member.lastLoginDate) || null : null;
        default: return null;
    }
};

@Component({
    selector: 'planetside-outfit',
    templateUrl: './planetside-outfit.component.html',
    styleUrls: ['./planetside-outfit.component.css'],
    imports: [
        ChipsComponent, MatCard, MatCardTitle, MatCardContent, MatSort, MatSortHeader, MatIcon, RouterLink, DecimalPipe, PercentPipe, DatePipe,
        LoaderComponent, ErrorCardComponent, OutfitCardComponent
    ]
})
export class PlanetsideOutfitComponent {
    private outfitRepository = inject(OutfitRepository);

    readonly id = input<string>();

    readonly filters: { id: RosterFilter; label: string }[] = [
        { id: 'all', label: 'All' },
        { id: 'active7', label: 'Active 7 days' },
        { id: 'active30', label: 'Active 30 days' },
        { id: 'untracked', label: 'Untracked' }
    ];

    readonly kdr = kdr;
    readonly accuracy = accuracy;
    readonly hsr = hsr;
    readonly siege = siege;
    readonly spm = spm;
    readonly timeAgo = timeAgo;

    readonly sort = signal<Sort>({ active: 'rank', direction: 'asc' });
    readonly search = signal('');
    readonly activeFilter = signal<RosterFilter>('all');
    readonly page = signal(0);
    readonly pageSize = ROSTER_PAGE_SIZE;
    readonly expanded = signal<ReadonlySet<string | undefined>>(new Set());

    private readonly outfitResult = toSignal(toObservable(this.id).pipe(
        filter((id): id is string => !!id),
        switchMap(id => this.outfitRepository.getOutfit(id).pipe(
            map((data): Result<OutfitDetails> => ({ data })),
            catchError(error => of<Result<OutfitDetails>>({ error: getErrorMessage(error) })),
            startWith(undefined)))));

    private readonly membersResult = toSignal(toObservable(this.id).pipe(
        filter((id): id is string => !!id),
        switchMap(id => this.outfitRepository.getMembers(id).pipe(
            map((data): Result<OutfitMemberDetails[]> => ({ data })),
            catchError(error => of<Result<OutfitMemberDetails[]>>({ error: getErrorMessage(error) })),
            startWith(undefined)))));

    readonly isLoading = computed(() => this.outfitResult() === undefined);
    readonly isLoadingMembers = computed(() => this.membersResult() === undefined);
    readonly errorMessage = computed(() => {
        const result = this.outfitResult();
        return result && 'error' in result ? result.error : null;
    });
    readonly membersFailed = computed(() => {
        const result = this.membersResult();
        return !!result && 'error' in result;
    });

    readonly outfit = computed(() => {
        const result = this.outfitResult();
        return result && 'data' in result ? result.data : null;
    });
    readonly members = computed(() => {
        const result = this.membersResult();
        return result && 'data' in result ? result.data : [];
    });

    /** Members with lifetime stats; the others are not tracked yet. */
    private readonly tracked = computed(() => this.members().filter(member => member.lifetimeStats));

    private figures(read: (member: OutfitMemberDetails) => number | null): number[] {
        return this.tracked().map(read).filter((value): value is number => value !== null);
    }

    /** The outfit's average and median figures, over the members that are tracked. */
    readonly summary = computed(() => {
        const kdrs = this.figures(kdr);
        const spms = this.figures(spm);
        return { kdr: { mean: mean(kdrs), median: median(kdrs) }, spm: { mean: mean(spms), median: median(spms) } };
    });

    /** How much of the outfit was active within a period, as a share of its members. */
    readonly activity = computed(() => {
        const outfit = this.outfit();
        const period = (label: string, count = 0) => ({ label, count, share: outfit?.memberCount ? Math.min(count / outfit.memberCount, 1) : 0 });
        return [
            period('Active 7 days', outfit?.activity7Days),
            period('Active 30 days', outfit?.activity30Days),
            period('Active 90 days', outfit?.activity90Days)
        ];
    });

    private readonly filtered = computed(() => {
        const search = this.search().trim().toLowerCase();
        const activeFilter = this.activeFilter();

        return this.members().filter(member => {
            if (search && !member.name?.toLowerCase().includes(search)) {
                return false;
            }
            switch (activeFilter) {
                case 'active7': return isWithin(member.lastLoginDate, 7);
                case 'active30': return isWithin(member.lastLoginDate, 30);
                case 'untracked': return !member.lifetimeStats;
                default: return true;
            }
        });
    });

    readonly filteredCount = computed(() => this.filtered().length);

    private readonly sorted = computed(() => sortRows(this.filtered(), this.sort(), sortValue));

    readonly rows = computed(() => this.sorted().slice(this.page() * this.pageSize, (this.page() + 1) * this.pageSize));
    readonly firstRow = computed(() => this.page() * this.pageSize + 1);
    readonly lastRow = computed(() => this.page() * this.pageSize + this.rows().length);
    readonly hasNext = computed(() => this.lastRow() < this.filteredCount());

    /** How many members each quick filter would show, ignoring the name search. */
    readonly counts = computed(() => {
        const members = this.members();
        return {
            all: members.length,
            active7: members.filter(member => isWithin(member.lastLoginDate, 7)).length,
            active30: members.filter(member => isWithin(member.lastLoginDate, 30)).length,
            untracked: members.filter(member => !member.lifetimeStats).length
        } satisfies Record<RosterFilter, number>;
    });

    readonly filterOptions = computed<ChipOption<RosterFilter>[]>(() =>
        this.filters.map(option => ({ value: option.id, label: option.label, count: this.counts()[option.id] })));

    onSort(sort: Sort) {
        this.sort.set(sort);
        this.page.set(0);
    }

    onSearch(value: string) {
        this.search.set(value);
        this.page.set(0);
    }

    setFilter(filterId: RosterFilter) {
        this.activeFilter.set(filterId);
        this.page.set(0);
    }

    goToPage(page: number) {
        this.page.set(page);
    }

    toggle(id: string | undefined) {
        this.expanded.update(open => {
            const next = new Set(open);
            if (!next.delete(id)) {
                next.add(id);
            }
            return next;
        });
    }
}
