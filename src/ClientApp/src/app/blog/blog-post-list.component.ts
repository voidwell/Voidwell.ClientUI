import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { VoidwellApi } from '../shared/services/voidwell-api.service';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'voidwell-blog-post-list',
    templateUrl: './blog-post-list.template.html',
    styleUrls: ['./../app.styles.css', './blog.styles.css', './blog-post-list.styles.css'],
    providers: [VoidwellApi]
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