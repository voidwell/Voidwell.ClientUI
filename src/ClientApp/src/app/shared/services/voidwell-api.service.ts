import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/catch'
//import { IpreoAccountAuthService } from '../services/ipreoaccount-auth.service';
import { Http, RequestOptions, Response } from '@angular/http';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../app.component';
import { Injectable } from '@angular/core';
import * as actionType from '../../reducers';

@Injectable()
export class VoidwellApi {
    apiBaseUrl = 'app/';
    public blogUrl = location.origin + '/api/vw/blog/';
    public authUrl = location.origin + '/api/auth/';

    public options;
    private _requestTimeout = 30000;
    private _requestTimeoutMessage = 'Request timed out';

    constructor(//public authService: IpreoAccountAuthService,
        public http: Http,
        public ngRedux: NgRedux<IAppState>) {
        this.options = new RequestOptions(/*{ headers: this.authService.getAuthHeaders() }*/);
    }

    getAllBlogPosts() {
        this.ngRedux.dispatch({ type: 'GET_BLOG_POSTS' });

        let payload = [
            {
                "title": "Test Title",
                "content": "Test Test Test",
                "author": "Lampjaw",
                "id": "123xyz",
                "publishDate": "test"
            },
            {
                "title": "Test Title2",
                "content": "Test Test Test",
                "author": "Lampjaw",
                "id": "123xyz2",
                "publishDate": "test2"
            },
            {
                "title": "Test Title3",
                "content": "Test Test Test",
                "author": "Lampjaw",
                "id": "123xyz3",
                "publishDate": "test3"
            }
        ];

        this.ngRedux.dispatch({ type: 'GET_BLOG_POSTS_SUCCESS', payload });

        return this.http.get(this.blogUrl, this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'BLOG_POSTS_FAIL' });
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            })
            .map(payload => ({ type: 'GET_BLOG_POSTS_SUCCESS', payload }))
            .subscribe(action => this.ngRedux.dispatch(action));
    }

    getBlogPost(blogPostId: string) {
        this.ngRedux.dispatch({ type: 'GET_BLOG_POST' });

        return this.http.get(this.blogUrl + blogPostId, this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'BLOG_POST_FAIL' });
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            })
            .map(payload => ({ type: 'GET_BLOG_POST_SUCCESS', payload }))
            .subscribe(action => this.ngRedux.dispatch(action));
    }

    accountRegister(registrationForm: any) {
        this.ngRedux.dispatch({ type: 'REGISTER_USER' });

        return this.http.post(this.authUrl + 'register', registrationForm, this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'REGISTRATION_FAIL' });
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            })
            .map(payload => ({ type: 'REGISTER_USER_SUCCESS', payload }))
            .subscribe(action => this.ngRedux.dispatch(action));
    }

    accoutLogin(loginForm: any) {
        this.ngRedux.dispatch({ type: 'LOGIN_USER' });

        return this.http.post(this.authUrl + 'login', loginForm, this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOGIN_FAIL' });
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            })
            .map(payload => ({ type: 'LOGIN_USER_SUCCESS', payload }))
            .subscribe(action => this.ngRedux.dispatch(action));
    }

    /*
    getRoles() {
        return this.AuthGet(this.rolesDataUrl + 'roles/', this.options)
            .map(resp => this.extractData(resp, 'roles'))
            .catch(res => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', res });
                return this.handleError(res);
            })
            .map(payload => ({ type: 'GET_USER_ROLES', payload }))
            .subscribe(action => this.ngRedux.dispatch(action));
    }
    */

    private handleError(error: any) {
        this.checkAuthorization(error);
        return Observable.throw(error);
    }

    private checkAuthorization(error: Response) {
        if (error.status === 401) {
            //this.authService.checkSession();
        }
    }

    AuthGet(url: string, options: RequestOptions): Observable<Response> {
        return this.http.get(url, options).timeout(this._requestTimeout);
    }

    AuthPost(url: string, data: any, options: RequestOptions): Observable<Response> {
        return this.http.post(url, data, options).timeout(this._requestTimeout);
    }

    AuthPut(url: string, data: any, options: RequestOptions): Observable<Response> {
        return this.http.put(url, data, options).timeout(this._requestTimeout);
    }

    AuthDelete(url: string, options: RequestOptions): Observable<Response> {
        return this.http.delete(url, options).timeout(this._requestTimeout);
    }

    private extractData(res: Response, key?: string) {
        let body = res.json();
        if (key) {
            return body[key];
        }
        return body.data || {};
    }
}