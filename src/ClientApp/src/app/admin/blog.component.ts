import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { VoidwellApi } from '../shared/services/voidwell-api.service';
import { Observable } from 'rxjs/Observable';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'voidwell-admin-blog',
    templateUrl: './blog.template.html',
    styleUrls: ['../app.styles.css'],
    providers: [VoidwellApi]
})

export class BlogComponent implements OnInit {
    blogPosts: Array<any>;
    isLoading: boolean;
    isCreating: boolean;
    getBlogPostsRequest: Subscription;

    constructor(private api: VoidwellApi) {

    }

    ngOnInit() {
        this.isLoading = true;
        this.getBlogPostsRequest = this.api.getAllBlogPosts()
            .subscribe(blogPosts => {
                this.blogPosts = blogPosts;
                this.isLoading = false;
            });
    }

    onCreateBlogPost(blogPostForm: NgForm) {
        if (blogPostForm.valid) {
            let blogPost = blogPostForm.value;

            this.isLoading = true;
            this.api.createBlogPost(blogPost)
                .subscribe(result => {
                    blogPostForm.reset();
                    this.isCreating = false;
                    this.isLoading = false;
                });
        }
    }

    onUpdateBlogPost(blogPostForm: NgForm) {
        if (blogPostForm.valid) {
            let blogPost = blogPostForm.value;

            this.isLoading = true;
            this.api.updateBlogPost(blogPost)
                .subscribe(result => {
                    this.isLoading = false;
                });
        }
    }

    onDeleteBlogPost(blogPostId: string) {
        this.isLoading = true;

        this.api.deleteBlogPost(blogPostId)
            .subscribe(result => {
                this.isLoading = false;
            });
    }
}