import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { PlanetsideApi } from './../planetside-api.service';

@Component({
    selector: 'planetside-news',
    templateUrl: './planetside-news.template.html',
    styleUrls: ['../../app.styles.css', './planetside-news.styles.css'],
    providers: [PlanetsideApi]
})

export class PlanetsideNewsComponent {
    errorMessage: string = null;
    isLoading: boolean;
    isNewsLoading: boolean;
    isUpdatesLoading: boolean;

    newsList: any;
    updateList: any;

    constructor(private api: PlanetsideApi) {
        this.errorMessage = null;
        this.isLoading = true;
        this.isNewsLoading = true;
        this.isUpdatesLoading = true;

        this.api.getNews()
            .catch(error => {
                this.errorMessage = error._body;
                this.isLoading = false;
                return Observable.of(error);
            })
            .subscribe(newsList => {
                this.newsList = newsList;
                this.isNewsLoading = false;
                this.updateLoading();
            });

        this.api.getUpdates()
            .catch(error => {
                this.errorMessage = error._body;
                this.isLoading = false;
                return Observable.of(error);
            })
            .subscribe(updateList => {
                this.updateList = updateList;
                this.isUpdatesLoading = false;
                this.updateLoading();
            });
    }

    private updateLoading() {
        this.isLoading = this.isNewsLoading && this.isUpdatesLoading;
    }
}