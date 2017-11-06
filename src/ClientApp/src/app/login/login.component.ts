import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { NgRedux } from '@angular-redux/store';
import { VoidwellApi } from '../shared/services/voidwell-api.service';
import { IAppState } from '../app.component';
import { BlogPost } from './blogPost';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'voidwell-login',
    templateUrl: './login.template.html',
    styleUrls: ['../app.styles.css'],
    providers: [VoidwellApi]
})

export class LoginComponent implements OnDestroy {
    self = this;
    errorMessage: string = null;

    blogPost: BlogPost;

    searchState: Observable<any>;
    routeSub: Subscription;
    blogPostRequest: Subscription;
    stateSub: Subscription;
    loadingStatus: string;
    isLoadingBlogPost: boolean;

    constructor(private api: VoidwellApi, private route: ActivatedRoute, public ngRedux: NgRedux<IAppState>) {
        this.routeSub = this.route.params.subscribe(params => {
            let id = params['id'];
            this.blogPostRequest = this.api.getBlogPost(id);
        });
        this.searchState = this.ngRedux.select('blogPost');
        this.stateSub = this.searchState.subscribe(blogPost => {
            if (blogPost) {
                this.isLoadingBlogPost = blogPost.status === 'loading';
                this.loadingStatus = blogPost.status;
            }

            this.onChange(blogPost);
        });
    }

    onChange(blogPost: any) {
        this.blogPost = blogPost;
    }

    ngOnDestroy() {
        if (this.routeSub) {
            this.routeSub.unsubscribe();
        }

        if (this.stateSub) {
            this.stateSub.unsubscribe();
        }

        if (this.blogPostRequest) {
            this.blogPostRequest.unsubscribe();
        }
    }
}