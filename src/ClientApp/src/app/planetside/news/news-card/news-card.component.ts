import { Component, Input } from '@angular/core';

@Component({
    selector: 'vw-news-card',
    templateUrl: './news-card.template.html',
    styleUrls: ['./news-card.styles.css']
})

export class NewsCardComponent {
    @Input('post') post: any;
}