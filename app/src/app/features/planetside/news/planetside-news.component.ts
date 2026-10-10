import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FeedItem } from '@core/api/models/ps2/reference.model';
import { FeedsRepository } from '@core/api/ps2/feeds.repository';
import { getErrorMessage } from '@core/util/error-message';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { NewsCardComponent } from './news-card/news-card.component';
import { MatCard, MatCardTitle, MatCardContent } from '@angular/material/card';

@Component({
    selector: 'planetside-news',
    templateUrl: './planetside-news.component.html',
    styleUrls: ['./planetside-news.component.css'],
    imports: [ErrorMessageComponent, LoaderComponent, NewsCardComponent, MatCard, MatCardTitle, MatCardContent]
})

export class PlanetsideNewsComponent {
    private feedsRepository = inject(FeedsRepository);
    private cdr = inject(ChangeDetectorRef);

    errorMessage: string = null;
    isLoading: boolean;
    isNewsLoading: boolean;
    isUpdatesLoading: boolean;

    newsList: FeedItem[];
    updateList: FeedItem[];

    constructor() {
        this.errorMessage = null;
        this.isLoading = true;
        this.isNewsLoading = true;
        this.isUpdatesLoading = true;

        this.feedsRepository.getNews()
            .pipe(catchError(error => {
                this.errorMessage = getErrorMessage(error);
                this.isLoading = false;
                return of([] as FeedItem[]);
            }))
            .subscribe(newsList => {
                this.newsList = newsList;
                this.isNewsLoading = false;
                this.updateLoading();
                this.cdr.markForCheck();
            });

        this.feedsRepository.getUpdates()
            .pipe(catchError(error => {
                this.errorMessage = getErrorMessage(error);
                this.isLoading = false;
                return of([] as FeedItem[]);
            }))
            .subscribe(updateList => {
                this.updateList = updateList;
                this.isUpdatesLoading = false;
                this.updateLoading();
                this.cdr.markForCheck();
            });
    }

    private updateLoading() {
        this.isLoading = this.isNewsLoading && this.isUpdatesLoading;
    }
}