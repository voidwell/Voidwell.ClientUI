import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BLOG_URL } from './constants';
import { Observable, of } from 'rxjs';
import { BlogPost } from './contracts/blogpost.model';

@Injectable()
export class BlogRepository {
    constructor(private http: HttpClient) {}

    getAllBlogPosts(): Observable<BlogPost[]> {
        return this.http.get<BlogPost[]>(BLOG_URL)
    }

    getBlogPost(blogPostId: string): Observable<BlogPost> {
        return this.http.get<BlogPost>(`${BLOG_URL}/${blogPostId}`);
    }
}