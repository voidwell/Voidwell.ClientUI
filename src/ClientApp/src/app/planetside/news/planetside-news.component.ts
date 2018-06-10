import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
            .pipe<any>(catchError(error => {
                this.errorMessage = error._body;
                this.isLoading = false;
                return of(error);
            }))
            .subscribe(newsList => {
                this.newsList = newsList;
                this.isNewsLoading = false;
                this.updateLoading();
            });

        this.api.getUpdates()
            .pipe<any>(catchError(error => {
                this.errorMessage = error._body;
                this.isLoading = false;
                return of(error);
            }))
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