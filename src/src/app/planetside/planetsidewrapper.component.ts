import { Component, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { WithSubStore, dispatch, select } from '@angular-redux/store';
import { Observable, Subscription } from 'rxjs';
import { PlanetsideApi } from './shared/services/planetside-api.service';
import { SearchService, SearchState } from './../shared/services/search.service';
import reducers from './planetside.reducers';
import { CHANGE_PLATFORM } from './reducers';

@WithSubStore({
    basePathMethodName: 'getBasePath',
    localReducer: reducers
})
@Component({
    selector: 'voidwell-planetside-wrapper',
    templateUrl: './planetsidewrapper.template.html',
    styleUrls: ['./planetsidewrapper.styles.css'],
    encapsulation: ViewEncapsulation.None
})

export class PlanetsideWrapperComponent implements OnDestroy {
    private queryWait: any;
    private activeSelection: any;
    private activePlatform: string = 'pc';

    private searchSub: Subscription;
    private resultSub: Subscription;
    private platformSub: Subscription;

    @select('platform') readonly platform$: Observable<any>;
    @dispatch() initializeState = () => ({ type: CHANGE_PLATFORM, value: 'pc' });

    constructor(private api: PlanetsideApi, private router: Router, private searchService: SearchService) {
        this.initializeState();

        this.platformSub = this.platform$.subscribe((platformState: any) => {
            if (platformState && this.activePlatform !== platformState.platform) {
                this.activePlatform = platformState.platform;
                this.router.navigateByUrl('ps2');
            }
        });

        let searchPlaceholder = 'Search for players, outfits, and weapons';
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

                this.api.search(query.category, query.query).subscribe(data => {
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
        if (this.platformSub) this.platformSub.unsubscribe();
    }

    private getBasePath() {
        return ['ps2'];
    }
}