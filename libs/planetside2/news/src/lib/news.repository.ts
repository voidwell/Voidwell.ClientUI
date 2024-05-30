import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FEEDS_URL } from './constants';
import { Observable } from 'rxjs';
import { NewsPost } from './contracts/news-post.model';

@Injectable()
export class NewsRepository {
    constructor(private http: HttpClient) {}

    getNews(): Observable<NewsPost[]> {
        return this.http.get<NewsPost[]>(`${FEEDS_URL}/news`);
    }

    getUpdates(): Observable<NewsPost[]> {
        return this.http.get<NewsPost[]>(`${FEEDS_URL}/updates`);
    }
}
