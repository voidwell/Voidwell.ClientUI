import { ChangeDetectorRef, Component, inject, effect, input, untracked } from '@angular/core';
import { BlogPost } from '@core/api/models/platform/post.model';
import { PostRepository } from '@core/api/platform/post.repository';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { ErrorMessageComponent } from '@shared/ui/error-message/error-message.component';
import { BlogCardComponent } from '../blog-card/blog-card.component';

@Component({
    selector: 'voidwell-blog-post',
    templateUrl: './blog-post.component.html',
    styleUrls: ['./blog-post.component.css'],
    imports: [LoaderComponent, ErrorMessageComponent, BlogCardComponent]
})

export class BlogPostComponent {
    private postRepository = inject(PostRepository);
    private cdr = inject(ChangeDetectorRef);
    readonly id = input<string>();

    self = this;
    errorMessage: string = null;

    blogPost: BlogPost;
    isLoading: boolean;

    constructor() {
        effect(() => {
            const id = this.id();

            untracked(() => {
                this.isLoading = true;

                this.postRepository.getPost(id)
                    .subscribe(post => {
                        this.blogPost = post;
                        this.isLoading = false;
                        this.cdr.markForCheck();
                    });
            });
        });
    }
}