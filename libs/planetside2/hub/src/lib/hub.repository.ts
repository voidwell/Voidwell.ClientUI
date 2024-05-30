import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SearchResult } from './contracts/search-result.model';
import { PS2_API_ROOT } from '@voidwell/planetside2/common';
import { Observable } from 'rxjs';

@Injectable()
export class HubRepository {    
    constructor(private http: HttpClient) {}

    search(platform: string, category: string, query: string): Observable<SearchResult[]> {
        return this.http.get<SearchResult[]>(`${PS2_API_ROOT}/search/${category}/${query}?platform=${platform}`);
    }
}
