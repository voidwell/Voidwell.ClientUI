import { Component, ViewEncapsulation, OnDestroy, inject, computed } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { SearchService, SearchState } from '@core/layout/search.service';
import { AppState } from '@core/store/app.states';
import { selectPlanetsideState } from '@core/platform/store/planetside.states';
import { PLATFORM_QUERY_PARAM } from '@core/platform/platforms';
import { SearchRepository } from '@core/api/ps2/search.repository';
import { SearchResult } from '@core/api/models/ps2/reference.model';

@Component({
    selector: 'voidwell-planetside-wrapper',
    templateUrl: './planetside-wrapper.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [RouterOutlet]
})

export class PlanetsideWrapperComponent implements OnDestroy {
    private searchRepository = inject(SearchRepository);
    private router = inject(Router);
    private searchService = inject(SearchService);
    private store = inject<Store<AppState>>(Store);

    private queryWait: ReturnType<typeof setTimeout>;
    private activeSelection: SearchResult;

    private searchSub: Subscription;
    private resultSub: Subscription;

    private planetside = this.store.selectSignal(selectPlanetsideState);

    private readonly resultPages: Record<string, string> = {
        character: 'player',
        outfit: 'outfit',
        item: 'item'
    };

    /**
     * The platform the page shows. The outlet is rebuilt when it changes, so the current page loads again from
     * the new platform without every page having to watch for the change.
     */
    readonly platform = computed(() => this.planetside().platform);

    constructor() {
        const searchService = this.searchService;

        const searchPlaceholder = 'Search for players, outfits, and weapons';
        searchService.attach(searchPlaceholder);

        searchService.categoryControl.setValue('character');

        this.searchSub = searchService.onEntry.subscribe(query => {
            clearTimeout(this.queryWait);

            if (!query || !query.query || query.query.length < 2) {
                return;
            }

            this.queryWait = setTimeout(() => {
                if (this.activeSelection && this.activeSelection.name === query.query) {
                    return;
                }

                this.searchService.searchState.emit(new SearchState(true));

                this.searchRepository.search(query.category, query.query).subscribe(data => {
                    this.searchService.searchState.emit(new SearchState(false, data));
                });
            }, 1000);
        });

        this.resultSub = searchService.onClickResult.subscribe(result => {
            this.activeSelection = result;

            const page = this.resultPages[result.type ?? ''];
            if (page) {
                this.router.navigate(['/ps2', page, result.id], { queryParams: { [PLATFORM_QUERY_PARAM]: this.platform() } });
            }
        });
    }

    ngOnDestroy() {
        this.searchService.detach();
        this.searchSub.unsubscribe();
        this.resultSub.unsubscribe();
    }
}