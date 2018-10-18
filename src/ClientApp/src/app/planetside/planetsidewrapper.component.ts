import { Component, EventEmitter, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PlanetsideApi } from './shared/services/planetside-api.service';
import { SearchService, SearchState } from './../shared/services/search.service';

@Component({
    selector: 'voidwell-planetside-wrapper',
    templateUrl: './planetsidewrapper.template.html',
    styleUrls: ['./planetsidewrapper.styles.css'],
    encapsulation: ViewEncapsulation.None
})

export class PlanetsideWrapperComponent implements OnDestroy {
    private queryWait: any;
    private activeSelection: any;

    private searchSub: Subscription;
    private resultSub: Subscription;

    constructor(private api: PlanetsideApi, private router: Router, private searchService: SearchService) {
        let searchPlaceholder = 'Search for players, outfits, and weapons';
        searchService.attach(searchPlaceholder);

        this.searchSub = searchService.onEntry.subscribe(query => {
            clearTimeout(this.queryWait);

            if (!query || query.length < 2) {
                return;
            }

            this.queryWait = setTimeout(() => {
                if (this.activeSelection && this.activeSelection.name === query) {
                    return;
                }

                this.searchService.searchState.emit(new SearchState(true));

                this.api.search(query).subscribe(data => {
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