import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { PlanetsideApi } from './../planetside-api.service';

@Component({
    selector: 'planetside-search',
    templateUrl: './planetside-search.template.html',
    styleUrls: ['../../app.styles.css', './planetside-search.styles.css'],
    providers: [PlanetsideApi]
})

export class PlanetsideSearchComponent {
    errorMessage: string = null;
    isLoading: boolean;
    query: string;

    results: Array<any> = [];
    routeSub: Subscription;

    constructor(private api: PlanetsideApi, private route: ActivatedRoute) {
        this.routeSub = this.route.params.subscribe(params => {
            this.results = [];
            let query = params['query'];
            this.query = query;

            if (query !== undefined && query !== '') {
                this.isLoading = true;
                this.api.search(query)
                    .subscribe(results => {
                        this.results = results;
                        this.isLoading = false;
                    });
            }
        });
    }
}