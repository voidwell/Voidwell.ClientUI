import { Observable } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { Http, RequestOptions, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { VoidwellAuthService } from './../services/voidwell-auth.service';

@Injectable()
export class ApiBase {
    private options;
    private _requestTimeout = 60000;
    private _requestTimeoutMessage = 'Request timed out';

    constructor(public authService: VoidwellAuthService,
        public http: Http) {
        this.options = new RequestOptions({ headers: this.authService.getAuthHeaders() });
    }

    protected Get(url: string): Observable<Response> {
        return this.requestWrapper(this.http.get(url));
    }

    protected Post(url: string, data: any): Observable<Response> {
        return this.requestWrapper(this.http.post(url, data));
    }

    protected Put(url: string, data: any): Observable<Response> {
        return this.requestWrapper(this.http.put(url, data));
    }

    protected Delete(url: string): Observable<Response> {
        return this.requestWrapper(this.http.delete(url));
    }

    protected AuthGet(url: string): Observable<Response> {
        return this.requestWrapper(this.http.get(url, this.options));
    }

    protected AuthPost(url: string, data: any): Observable<Response> {
        return this.requestWrapper(this.http.post(url, data, this.options));
    }

    protected AuthPut(url: string, data: any): Observable<Response> {
        return this.requestWrapper(this.http.put(url, data, this.options));
    }

    protected AuthDelete(url: string): Observable<Response> {
        return this.requestWrapper(this.http.delete(url, this.options));
    }

    private requestWrapper(request: Observable<Response>): Observable<Response> {
        return request
            .pipe(timeout(this._requestTimeout))
            .pipe(catchError(error => {
                return this.handleError(error);
            }));
    }

    private handleError(error: any) {
        if (error.status === 401) {
            this.authService.checkSession();
        }

        return Observable.throw(error);
    }

    protected extractData(res: Response, key?: string) {
        let body = res.json();
        if (key) {
            return body[key];
        }
        return body.data || {};
    }
}