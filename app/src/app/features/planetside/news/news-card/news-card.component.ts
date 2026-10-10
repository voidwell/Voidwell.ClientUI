import { Component, Input } from '@angular/core';
import { FeedItem } from '@core/api/models/ps2/reference.model';
import { MatCard, MatCardTitle, MatCardSubtitle, MatCardContent } from '@angular/material/card';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'vw-news-card',
    templateUrl: './news-card.component.html',
    styleUrls: ['./news-card.component.css'],
    imports: [MatCard, MatCardTitle, MatCardSubtitle, MatCardContent, DatePipe]
})

export class NewsCardComponent {
    @Input() post: FeedItem;
}