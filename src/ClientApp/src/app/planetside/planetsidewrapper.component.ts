import { Component, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { PlanetsideApi } from './planetside-api.service';
import { SearchService } from './../shared/services/search.service';

@Component({
    selector: 'voidwell-planetside-wrapper',
    templateUrl: './planetsidewrapper.template.html',
    styleUrls: ['./planetsidewrapper.styles.css'],
    encapsulation: ViewEncapsulation.None
})

export class PlanetsideWrapperComponent implements OnDestroy {
    isSearching: boolean = false;

    private queryWait: any;
    private filteredResults: Observable<any[]>;
    private activeSelection: any;

    searchControl: FormControl;

    private searchSub: Subscription;
    private resultSub: Subscription;

    constructor(private api: PlanetsideApi, private router: Router, private searchService: SearchService) {
        searchService.isUsable = true;
        searchService.placeholder = "Search for players, outfits, and weapons";

        this.searchSub = searchService.onEntry.subscribe(query => {
            clearTimeout(this.queryWait);

            if (!query || query.length < 2) {
                return;
            }

            this.queryWait = setTimeout(() => {
                if (this.activeSelection && this.activeSelection.name === query) {
                    return;
                }

                this.isSearching = true;
                this.searchService.results = [];

                this.api.search(query).subscribe(data => {
                    this.searchService.results = data;
                    this.isSearching = false;
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
        this.searchService.clearSearch();
        this.searchService.isUsable = false;
        this.searchSub.unsubscribe();
        this.resultSub.unsubscribe();
    }
}