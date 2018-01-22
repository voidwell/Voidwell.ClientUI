import { Component, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { PlanetsideApi } from './planetside-api.service';

@Component({
    selector: 'voidwell-planetside-wrapper',
    templateUrl: './planetsidewrapper.template.html',
    styleUrls: ['./planetsidewrapper.styles.css', './planetside.styles.css'],
    providers: [PlanetsideApi],
    encapsulation: ViewEncapsulation.None
})

export class PlanetsideWrapperComponent {
    private queryWait: any;
    private filteredResults: Observable<any[]>;

    results: any[];
    searchControl: FormControl;

    navLinks = [
        { path: 'news', label: 'News' },
        { path: 'alerts', label: 'Alerts' },
        { path: 'events', label: 'Events' }
    ];

    constructor(private api: PlanetsideApi, private router: Router) {
        this.searchControl = new FormControl();

        this.searchControl.valueChanges
            .subscribe(query => {
                this.getSearchResults(query);
            });
    }

    onClickSearchResult(result: any) {
        if (result.type === 'character') {
            this.router.navigateByUrl('ps2/player/' + result.id);
        }
        if (result.type === 'outfit') {
            this.router.navigateByUrl('ps2/outfit/' + result.id);
        }
        if (result.type === 'item') {
            this.router.navigateByUrl('ps2/item/' + result.id);
        }
    }

    clearSearch() {
        if (this.searchControl.dirty) {
            this.searchControl.reset();
            this.results = [];
        }
    }

    getSearchResults(query: string) {
        clearTimeout(this.queryWait);

        if (!query || query.length === 0) {
            this.clearSearch();
        }

        if (!query || query.length < 2) {
            return;
        }

        this.queryWait = setTimeout(() => {
            this.results = [];
            this.api.search(query).subscribe(data => {
                this.results = data;
            });
        }, 1000);
    }
}