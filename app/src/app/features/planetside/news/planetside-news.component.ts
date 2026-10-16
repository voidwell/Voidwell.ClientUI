import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FeedItem } from '@core/api/models/ps2/reference.model';
import { FeedsRepository } from '@core/api/ps2/feeds.repository';
import { ErrorCardComponent } from '@shared/ui/error-card/error-card.component';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { NewsCardComponent } from './news-card/news-card.component';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';

@Component({
    selector: 'planetside-news',
    templateUrl: './planetside-news.component.html',
    styleUrls: ['./planetside-news.component.css'],
    imports: [ErrorCardComponent, LoaderComponent, NewsCardComponent, MatCard, MatCardTitle, MatCardContent]
})

export class PlanetsideNewsComponent {
    private feedsRepository = inject(FeedsRepository);
    private cdr = inject(ChangeDetectorRef);

    isNewsLoading: boolean;
    isUpdatesLoading: boolean;
    newsFailed = false;
    updatesFailed = false;

    newsList: FeedItem[];
    updateList: FeedItem[];

    constructor() {
        this.isNewsLoading = true;
        this.isUpdatesLoading = true;

        this.feedsRepository.getNews()
            .pipe(catchError(() => {
                this.newsFailed = true;
                this.isNewsLoading = false;
                return of([] as FeedItem[]);
            }))
            .subscribe(newsList => {
                this.newsList = newsList;
                this.isNewsLoading = false;
                this.cdr.markForCheck();
            });

        this.feedsRepository.getUpdates()
            .pipe(catchError(() => {
                this.updatesFailed = true;
                this.isUpdatesLoading = false;
                return of([] as FeedItem[]);
            }))
            .subscribe(updateList => {
                this.updateList = updateList;
                this.isUpdatesLoading = false;
                this.cdr.markForCheck();
            });
    }
}