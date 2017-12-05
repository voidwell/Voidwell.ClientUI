import { Component } from '@angular/core';
import { PlanetsideApi } from './../planetside-api.service';

@Component({
    selector: 'voidwell-planetside-news',
    templateUrl: './planetside-news.template.html',
    styleUrls: ['../../app.styles.css'],
    providers: [PlanetsideApi]
})

export class PlanetsideNewsComponent {
    errorMessage: string = null;
    isLoading: boolean;

    newsList: any;
    updateList: any;

    constructor(private api: PlanetsideApi) {
        this.api.getNews()
            .subscribe(newsList => {
                this.newsList = newsList;
            });

        this.api.getUpdates()
            .subscribe(updateList => {
                this.updateList = updateList;
            });
    }
}