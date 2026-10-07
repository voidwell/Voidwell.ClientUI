import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../api-client';
import { PLATFORM_API_URL } from '../api-routes';
import { BlogPost, BlogPostRequest, EditableBlogPost } from '../models/platform/post.model';

/** Voidwell.Platform `PostController` (`platform/post`). */
@Injectable({ providedIn: 'root' })
export class PostRepository {
    private api = inject(ApiClient);
    private readonly url = `${PLATFORM_API_URL}/post`;

    getPosts(page = 0): Observable<BlogPost[]> {
        return this.api.get<BlogPost[]>(this.url, { params: { page } });
    }

    getPost(blogPostId: string): Observable<BlogPost> {
        return this.api.get<BlogPost>(`${this.url}/${blogPostId}`);
    }

    /** Administrator only. */
    createPost(post: BlogPostRequest): Observable<BlogPost> {
        return this.api.post<BlogPost, BlogPostRequest>(this.url, post, { auth: true });
    }

    /** Administrator only. */
    deletePost(blogPostId: string): Observable<void> {
        return this.api.delete(`${this.url}/${blogPostId}`, { auth: true });
    }

    /** Administrator only. Returns the markdown source instead of rendered HTML. */
    getEditablePost(blogPostId: string): Observable<EditableBlogPost> {
        return this.api.get<EditableBlogPost>(`${this.url}/edit/${blogPostId}`, { auth: true });
    }

    /** Administrator only. */
    updatePost(blogPostId: string, post: BlogPostRequest): Observable<BlogPost> {
        return this.api.put<BlogPost, BlogPostRequest>(`${this.url}/edit/${blogPostId}`, post, { auth: true });
    }
}
