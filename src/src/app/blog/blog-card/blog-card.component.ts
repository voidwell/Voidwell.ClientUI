import { Component, Input } from '@angular/core';

@Component({
    selector: 'vw-blog-card',
    templateUrl: './blog-card.template.html',
    styleUrls: ['./blog-card.styles.css']
})

export class BlogCardComponent {
    @Input('post') blogPost: any;
}