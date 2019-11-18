import { Component, OnInit } from '@angular/core';
import { VoidwellApi } from './../../shared/services/voidwell-api.service';

@Component({
    selector: 'voidwell-blog-post-list',
    templateUrl: './blog-post-list.template.html',
    styleUrls: ['./blog-post-list.styles.css']
})

export class BlogPostListComponent implements OnInit {
    self = this;
    errorMessage: string = null;

    blogPosts: Array<any>;
    isLoading: boolean;

    constructor(private api: VoidwellApi) {
        
    }

    ngOnInit() {
        this.isLoading = true;
        this.api.getAllBlogPosts()
            .subscribe(blogPosts => {
                this.blogPosts = blogPosts;
                this.isLoading = false;
            });
    }
}