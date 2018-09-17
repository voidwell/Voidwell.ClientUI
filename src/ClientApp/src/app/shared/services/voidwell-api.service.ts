import { Observable } from 'rxjs';
import { map, timeout, catchError } from 'rxjs/operators';
import { Http, RequestOptions, Response } from '@angular/http';
import { NgRedux } from '@angular-redux/store';
import { IAppState } from './../../app.component';
import { Injectable } from '@angular/core';
import * as actionType from './../../reducers';
import { VoidwellAuthService } from './../services/voidwell-auth.service';
import { ApiBase } from './api-base';
import { RequestCache } from './../services/request-cache.service';

@Injectable()
export class VoidwellApi extends ApiBase {
    apiBaseUrl = 'app/';
    public blogUrl = location.origin + '/api/blog/';
    public eventsUrl = location.origin + '/api/events/';
    public accountUrl = location.origin + '/api/account/';
    public authAdminUrl = location.origin + '/api/authadmin/';
    public oidcAdminUrl = location.origin + '/api/oidcadmin/';
    public ps2Url = location.origin + '/api/ps2/';

    constructor(public authService: VoidwellAuthService,
        public http: Http,
        public cache: RequestCache,
        public ngRedux: NgRedux<IAppState>) {
        super(authService, http, cache);
    }

    getAllBlogPosts() {
        return this.Get(this.blogUrl)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getBlogPost(blogPostId: string) {
        return this.Get(this.blogUrl + blogPostId)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    createBlogPost(blogPost: any) {
        return this.AuthPost(this.blogUrl, blogPost)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    updateBlogPost(blogPostId: string, blogPost: any) {
        return this.AuthPut(this.blogUrl + blogPostId, blogPost)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    deleteBlogPost(blogPostId: string) {
        return this.AuthDelete(this.blogUrl + blogPostId);
    }

    accountRegister(registrationForm: any) {
        this.ngRedux.dispatch({ type: 'REGISTER_USER' });

        return this.Post(this.accountUrl + 'register', registrationForm)
            .pipe(map<Response, any>(resp => resp.ok ? null : resp.json()))
            .pipe(catchError(error => {
                this.ngRedux.dispatch({ type: 'REGISTRATION_FAIL', error });
                return Observable.throw(error);
            }))
            .pipe(map(payload => ({ type: 'REGISTER_USER_SUCCESS', payload })))
            .subscribe(action => this.ngRedux.dispatch(action));
    }

    getSecurityQuestions() {
        return this.Get(this.accountUrl + 'questions')
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getRoles() {
        return this.AuthGet(this.accountUrl + 'roles/')
            .pipe(map<Response, any>(resp => resp.json()))
            .pipe(map(payload => ({ type: 'GET_USER_ROLES', payload })))
            .subscribe(action => this.ngRedux.dispatch(action));
    }

    getUsers() {
        return this.AuthGet(this.authAdminUrl + 'users')
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getUser(userId: string) {
        return this.AuthGet(this.authAdminUrl + 'user/' + userId)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    updateUserRoles(userId: string, userForm: any) {
        return this.AuthPut(this.authAdminUrl + 'user/' + userId + '/roles', userForm)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    deleteUser(userId: string) {
        return this.AuthDelete(this.authAdminUrl + 'user/' + userId)
            .pipe(map<Response, any>(resp => resp.ok ? null : resp.json()));
    }

    lockUser(userId: string, params: any) {
        return this.AuthPost(this.authAdminUrl + 'user/' + userId + '/lock', params);
    }

    unlockUser(userId: string) {
        return this.AuthPost(this.authAdminUrl + 'user/' + userId + '/unlock', null);
    }

    getAllRoles() {
        return this.AuthGet(this.authAdminUrl + 'roles')
            .pipe(map<Response, any>(resp => resp.json()));
    }

    addRole(roleName: string) {
        let roleData = {
            name: roleName
        };
        return this.AuthPost(this.authAdminUrl + 'role', roleData)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    deleteRole(roleId: string) {
        return this.AuthDelete(this.authAdminUrl + 'role/' + roleId)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    changePassword(changePasswordForm: any) {
        return this.AuthPost(this.accountUrl + 'changepassword', changePasswordForm);
    }

    startResetPassword(passwordResetStartForm: any) {
        return this.Post(this.accountUrl + 'resetpasswordstart', passwordResetStartForm)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    resetPasswordQuestions(passwordResetQuestionsForm: any) {
        return this.Post(this.accountUrl + 'resetpasswordquestions', passwordResetQuestionsForm)
            .pipe(map<Response, any>(resp => this.extractData(resp, 'result')));
    }

    resetPassword(resetPasswordForm: any) {
        return this.Post(this.accountUrl + 'resetpassword', resetPasswordForm);
    }

    getCustomEvents() {
        return this.Get(this.eventsUrl)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getCustomEventsByGame(gameId: any) {
        return this.Get(this.eventsUrl + 'game/' + gameId)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getCustomEvent(eventId: any) {
        return this.Get(this.eventsUrl + eventId)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    updateCustomEvent(eventId: string, event: any) {
        return this.AuthPut(this.eventsUrl + eventId, event)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    createCustomEvent(event: any) {
        return this.AuthPost(this.eventsUrl, event)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getPS2AllServiceStatus() {
        return this.AuthGet(this.ps2Url + 'services/status')
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getPS2ServiceStatus(service: string) {
        return this.AuthGet(this.ps2Url + 'services/' + service + '/status')
            .pipe(map<Response, any>(resp => resp.json()));
    }

    enablePS2Service(service: string) {
        return this.AuthPost(this.ps2Url + 'services/' + service + '/enable', null)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    disablePS2Service(service: string) {
        return this.AuthPost(this.ps2Url + 'services/' + service + '/disable', null)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    setupWorldZones(worldId: string) {
        return this.AuthPost(this.ps2Url + 'worldstate/' + worldId + '/zone', null);
    }

    getPSBAccountSessions() {
        return this.AuthGet(this.ps2Url + 'psb/sessions')
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getAllClients() {
        return this.AuthGet(this.oidcAdminUrl + 'client')
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getClientById(clientId: string) {
        return this.AuthGet(this.oidcAdminUrl + 'client/' + clientId)
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getAllApiResources() {
        return this.AuthGet(this.oidcAdminUrl + 'resource')
            .pipe(map<Response, any>(resp => resp.json()));
    }

    getApiResourceById(resourceId: string) {
        return this.AuthGet(this.oidcAdminUrl + 'resource/' + resourceId)
            .pipe(map<Response, any>(resp => resp.json()));
    }
}