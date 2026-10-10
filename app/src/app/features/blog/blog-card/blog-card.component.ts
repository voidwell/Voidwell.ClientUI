import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { BlogPost } from '@core/api/models/platform/post.model';
import { MatCard, MatCardTitle, MatCardSubtitle, MatCardContent } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'vw-blog-card',
    templateUrl: './blog-card.component.html',
    styleUrls: ['./blog-card.component.css'],
    imports: [MatCard, MatCardTitle, RouterLink, MatCardSubtitle, MatCardContent, DatePipe]
})

export class BlogCardComponent {
    @Input() post: BlogPost;
}