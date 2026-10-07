import { Component, OnInit, inject } from '@angular/core';
import { BlogPost } from '@core/api/models/platform/post.model';
import { PostRepository } from '@core/api/platform/post.repository';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { BlogCardComponent } from '../blog-card/blog-card.component';

@Component({
    selector: 'voidwell-blog-post-list',
    templateUrl: './blog-post-list.component.html',
    styleUrls: ['./blog-post-list.component.css'],
    imports: [LoaderComponent, ErrorMessageComponent, BlogCardComponent]
})

export class BlogPostListComponent implements OnInit {
    private postRepository = inject(PostRepository);

    self = this;
    errorMessage: string = null;

    blogPosts: BlogPost[];
    isLoading: boolean;

    ngOnInit() {
        this.isLoading = true;
        this.postRepository.getPosts()
            .subscribe(blogPosts => {
                this.blogPosts = blogPosts;
                this.isLoading = false;
            });
    }
}