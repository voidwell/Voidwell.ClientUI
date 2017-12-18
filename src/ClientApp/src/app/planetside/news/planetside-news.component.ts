import { Component } from '@angular/core';
import { PlanetsideApi } from './../planetside-api.service';

@Component({
    selector: 'planetside-news',
    templateUrl: './planetside-news.template.html',
    styleUrls: ['../../app.styles.css', './planetside-news.styles.css'],
    providers: [PlanetsideApi]
})

export class PlanetsideNewsComponent {
    errorMessage: string = null;
    isNewsLoading: boolean;
    isUpdatesLoading: boolean;

    newsList: any;
    updateList: any;

    constructor(private api: PlanetsideApi) {
        this.isNewsLoading = true;
        this.isUpdatesLoading = true;

        this.api.getNews()
            .subscribe(newsList => {
                this.newsList = newsList;
                this.isNewsLoading = false;
            });

        this.api.getUpdates()
            .subscribe(updateList => {
                this.updateList = updateList;
                this.isUpdatesLoading = false;
            });
    }
}