import { Component, ViewEncapsulation, OnDestroy, inject, effect, untracked } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { SearchService, SearchState } from '@core/layout/search.service';
import { AppState } from '@core/store/app.states';
import { selectPlanetsideState } from '@core/platform/store/planetside.states';
import { SearchRepository } from '@core/api/ps2/search.repository';
import { SearchResult } from '@core/api/models/ps2/reference.model';

@Component({
    selector: 'voidwell-planetside-wrapper',
    templateUrl: './planetside-wrapper.component.html',
    styleUrls: ['./planetside-wrapper.component.css'],
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
    private activePlatform: string = 'pc';

    private searchSub: Subscription;
    private resultSub: Subscription;
    private planetside = this.store.selectSignal(selectPlanetsideState);

    constructor() {
        const searchService = this.searchService;

        effect(() => {
            const platformState = this.planetside();

            untracked(() => {
                if (platformState && this.activePlatform !== platformState.platform) {
                    this.activePlatform = platformState.platform;
                    this.router.navigateByUrl('ps2');
                }
            });
        });

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

            if (result.type === 'character') {
                this.router.navigateByUrl('ps2/player/' + result.id);
            }
            if (result.type === 'outfit') {
                this.router.navigateByUrl('ps2/outfit/' + result.id);
            }
            if (result.type === 'item') {
                this.router.navigateByUrl('ps2/item/' + result.id);
            }
        });
    }

    ngOnDestroy() {
        this.searchService.detach();
        this.searchSub.unsubscribe();
        this.resultSub.unsubscribe();
    }
}