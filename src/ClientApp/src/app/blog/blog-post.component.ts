import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { VoidwellApi } from '../shared/services/voidwell-api.service';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'voidwell-blog-post',
    templateUrl: './blog-post.template.html',
    styleUrls: ['./blog-post.styles.css'],
    providers: [VoidwellApi]
})

export class BlogPostComponent {
    self = this;
    errorMessage: string = null;

    blogPost: any;
    isLoading: boolean;
    routeSub: Subscription;

    constructor(private api: VoidwellApi, private route: ActivatedRoute) {
        this.routeSub = this.route.params.subscribe(params => {
            let id = params['id'];
            this.isLoading = true;

            this.api.getBlogPost(id)
                .subscribe(post => {
                    this.blogPost = post;
                    this.isLoading = false;
                });
        });
    }
}