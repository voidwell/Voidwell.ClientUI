import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { BlogPost } from '@core/api/models/platform/post.model';
import { PostRepository } from '@core/api/platform/post.repository';
import { BlogPostListComponent } from './blog-post-list.component';

describe('BlogPostListComponent loader', () => {
    it('hides the loader once the posts have loaded', () => {
        const posts = new Subject<BlogPost[]>();
        TestBed.configureTestingModule({ providers: [{ provide: PostRepository, useValue: { getPosts: () => posts } }] });
        const fixture = TestBed.createComponent(BlogPostListComponent);
        const loader = () => fixture.nativeElement.querySelector('svg.lds-dual-ring');

        fixture.detectChanges();
        expect(loader()).not.toBeNull();

        posts.next([]);
        fixture.detectChanges();
        expect(loader()).toBeNull();
    });
});
