import { Observable, throwError, of } from 'rxjs';
import { timeout, catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VoidwellAuthService } from './../services/voidwell-auth.service';
import { RequestCache } from './../services/request-cache.service';

@Injectable()
export class ApiBase {
    private options;
    private _requestTimeout = 60000;
    private _requestTimeoutMessage = 'Request timed out';

    constructor(public authService: VoidwellAuthService,
        public http: HttpClient, public cache: RequestCache) {
        this.options = { headers: this.authService.getAuthHeaders() };
    }

    protected Get(url: string, isCached: boolean = false): Observable<any> {
        return this.requestWrapper(url, this.http.get(url), isCached);
    }

    protected Post(url: string, data: any): Observable<any> {
        return this.requestWrapper(url, this.http.post(url, data));
    }

    protected Put(url: string, data: any): Observable<any> {
        return this.requestWrapper(url, this.http.put(url, data));
    }

    protected Delete(url: string): Observable<any> {
        return this.requestWrapper(url, this.http.delete(url));
    }

    protected AuthGet(url: string): Observable<any> {
        return this.requestWrapper(url, this.http.get(url, this.options));
    }

    protected AuthPost(url: string, data: any): Observable<any> {
        return this.requestWrapper(url, this.http.post(url, data, this.options));
    }

    protected AuthPut(url: string, data: any): Observable<any> {
        return this.requestWrapper(url, this.http.put(url, data, this.options));
    }

    protected AuthDelete(url: string): Observable<any> {
        return this.requestWrapper(url, this.http.delete(url, this.options));
    }

    private requestWrapper(url: string, request: Observable<any>, isCached: boolean = false): Observable<any> {
        if (isCached) {
            const cachedResponse = this.cache.get(url);
            if (cachedResponse) {
                return of(cachedResponse);
            }
        }

        let obsRequest = request
            .pipe(timeout(this._requestTimeout))
            .pipe(catchError(error => {
                return this.handleError(error);
            }));

        if (isCached) {
            obsRequest = obsRequest.pipe(tap(response => this.cache.put(url, response)));
        }

        return obsRequest;
    }

    private handleError(error: any) {
        if (error.status === 401) {
            this.authService.checkSession();
        }

        return throwError(error);
    }

    protected extractData(body: any, key?: string) {
        if (key) {
            return body[key];
        }
        return body || {};
    }
}