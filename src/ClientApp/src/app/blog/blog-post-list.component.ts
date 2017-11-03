import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { NgRedux } from '@angular-redux/store';
import { VoidwellApi } from '../shared/services/voidwell-api.service';
import { IAppState } from '../app.component';
import { BlogPost } from './blogPost';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'voidwell-blog-post-list',
    templateUrl: './blog-post-list.template.html',
    styleUrls: ['../app.styles.css'],
    providers: [VoidwellApi]
})

export class BlogPostListComponent implements OnInit, OnDestroy {
    self = this;
    errorMessage: string = null;

    blogPosts: BlogPost[];

    searchState: Observable<any>;
    blogPostListRequest: Subscription;
    stateSub: Subscription;
    loadingStatus: string;
    isLoadingBlogPosts: boolean;

    constructor(private api: VoidwellApi, private route: ActivatedRoute, public ngRedux: NgRedux<IAppState>) {
        this.searchState = this.ngRedux.select('blogPostList');
        this.stateSub = this.searchState.subscribe(blogPosts => {
            if (blogPosts) {
                this.isLoadingBlogPosts = blogPosts.status === 'loading';
                this.loadingStatus = blogPosts.status;
            }

            this.onChange(blogPosts);
        });
    }

    ngOnInit() {
        this.blogPostListRequest = this.api.getAllBlogPosts();
    }

    onChange(blogPosts: any) {
        if (blogPosts && blogPosts.blogPosts) {
            this.blogPosts = blogPosts.blogPosts;
        }
    }

    ngOnDestroy() {
        if (this.stateSub) {
            this.stateSub.unsubscribe();
        }

        if (this.blogPostListRequest) {
            this.blogPostListRequest.unsubscribe();
        }
    }
}