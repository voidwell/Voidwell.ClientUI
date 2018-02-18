import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/catch'
import 'rxjs/add/observable/throw';
import { Http, RequestOptions, Response } from '@angular/http';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from '../../app.component';
import { Injectable } from '@angular/core';
import * as actionType from '../../reducers';
import { VoidwellAuthService } from '../services/voidwell-auth.service';

@Injectable()
export class VoidwellApi {
    apiBaseUrl = 'app/';
    public blogUrl = location.origin + '/api/blog/';
    public eventsUrl = location.origin + '/api/events/';
    public accountUrl = location.origin + '/api/account/';
    public authAdminUrl = location.origin + '/api/authadmin/';
    public ps2ServiceUrl = location.origin + '/api/ps2/services/';

    public options;
    private _requestTimeout = 30000;
    private _requestTimeoutMessage = 'Request timed out';

    constructor(public authService: VoidwellAuthService,
        public http: Http,
        public ngRedux: NgRedux<IAppState>) {
        this.options = new RequestOptions({ headers: this.authService.getAuthHeaders() });
    }

    getAllBlogPosts() {
        return this.http.get(this.blogUrl, this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    getBlogPost(blogPostId: string) {
        return this.http.get(this.blogUrl + blogPostId, this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    createBlogPost(blogPost: any) {
        return this.AuthPost(this.blogUrl, blogPost, this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    updateBlogPost(blogPost: any) {
        return this.AuthPut(this.blogUrl, blogPost, this.options)
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    deleteBlogPost(blogPostId: string) {
        return this.AuthDelete(this.blogUrl + blogPostId, this.options)
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    accountRegister(registrationForm: any) {
        this.ngRedux.dispatch({ type: 'REGISTER_USER' });

        return this.http.post(this.accountUrl + 'register', registrationForm, this.options)
            .map(resp => resp.ok ? null : resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'REGISTRATION_FAIL', error });
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            })
            .map(payload => ({ type: 'REGISTER_USER_SUCCESS', payload }))
            .subscribe(action => this.ngRedux.dispatch(action));
    }

    getSecurityQuestions() {
        return this.http.get(this.accountUrl + 'questions', this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'SECURITY_QUESTIONS_FAIL' });
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    getRoles() {
        return this.AuthGet(this.accountUrl + 'roles/', this.options)
            .map(resp => resp.json())
            .catch(res => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', res });
                return this.handleError(res);
            })
            .map(payload => ({ type: 'GET_USER_ROLES', payload }))
            .subscribe(action => this.ngRedux.dispatch(action));;
    }

    getUsers() {
        return this.AuthGet(this.authAdminUrl + 'users', this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    getUser(userId: string) {
        return this.AuthGet(this.authAdminUrl + 'user/' + userId, this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    updateUserRoles(userId: string, userForm: any) {
        return this.AuthPut(this.authAdminUrl + 'user/' + userId + '/roles', userForm, this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    deleteUser(userId: string) {
        return this.AuthDelete(this.authAdminUrl + 'user/' + userId, this.options)
            .map(resp => resp.ok ? null :resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    lockUser(userId: string, params: any) {
        return this.AuthPost(this.authAdminUrl + 'user/' + userId + '/lock', params, this.options)
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    unlockUser(userId: string) {
        return this.AuthPost(this.authAdminUrl + 'user/' + userId + '/unlock', null, this.options)
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    getAllRoles() {
        return this.AuthGet(this.authAdminUrl + 'roles', this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    addRole(roleName: string) {
        let roleData = {
            name: roleName
        };
        return this.AuthPost(this.authAdminUrl + 'role', roleData, this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    deleteRole(roleId: string) {
        return this.AuthDelete(this.authAdminUrl + 'role/' + roleId, this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    changePassword(changePasswordForm: any) {
        return this.AuthPost(this.accountUrl + 'changepassword', changePasswordForm, this.options)
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    startResetPassword(passwordResetStartForm: any) {
        return this.http.post(this.accountUrl + 'resetpasswordstart', passwordResetStartForm, this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    resetPasswordQuestions(passwordResetQuestionsForm: any) {
        return this.http.post(this.accountUrl + 'resetpasswordquestions', passwordResetQuestionsForm, this.options)
            .map(resp => this.extractData(resp, 'result'))
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    resetPassword(resetPasswordForm: any) {
        return this.http.post(this.accountUrl + 'resetpassword', resetPasswordForm, this.options)
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    getCustomEvents() {
        return this.http.get(this.eventsUrl, this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    getCustomEventsByGame(gameId: any) {
        return this.http.get(this.eventsUrl + 'game/' + gameId, this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    getCustomEvent(eventId: any) {
        return this.http.get(this.eventsUrl + eventId, this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    updateCustomEvent(eventId: string, event: any) {
        return this.AuthPut(this.eventsUrl + eventId, event, this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    createCustomEvent(event: any) {
        return this.AuthPost(this.eventsUrl, event, this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    getPS2AllServiceStatus() {
        return this.AuthGet(this.ps2ServiceUrl + 'status', this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    getPS2ServiceStatus(service: string) {
        return this.AuthGet(this.ps2ServiceUrl + service + '/status', this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    enablePS2Service(service: string) {
        return this.AuthPost(this.ps2ServiceUrl + service + '/enable', null, this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    disablePS2Service(service: string) {
        return this.AuthPost(this.ps2ServiceUrl + service + '/disable', null, this.options)
            .map(resp => resp.json())
            .catch(error => {
                this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error });
                return this.handleError(error);
            });
    }

    private handleError(error: any) {
        this.checkAuthorization(error);
        return Observable.throw(error);
    }

    private checkAuthorization(error: Response) {
        if (error.status === 401) {
            this.authService.checkSession();
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