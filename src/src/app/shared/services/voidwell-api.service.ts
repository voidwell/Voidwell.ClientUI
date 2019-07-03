﻿import { Observable } from 'rxjs';
import { map, timeout, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
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
        public http: HttpClient,
        public cache: RequestCache,
        public ngRedux: NgRedux<IAppState>) {
        super(authService, http, cache);
    }

    getAllBlogPosts() {
        return this.Get(this.blogUrl);
    }

    getBlogPost(blogPostId: string) {
        return this.Get(this.blogUrl + blogPostId);
    }

    createBlogPost(blogPost: any) {
        return this.AuthPost(this.blogUrl, blogPost);
    }

    updateBlogPost(blogPostId: string, blogPost: any) {
        return this.AuthPut(this.blogUrl + blogPostId, blogPost);
    }

    deleteBlogPost(blogPostId: string) {
        return this.AuthDelete(this.blogUrl + blogPostId);
    }

    accountRegister(registrationForm: any) {
        this.ngRedux.dispatch({ type: 'REGISTER_USER' });

        return this.Post(this.accountUrl + 'register', registrationForm)
            .pipe(catchError(error => {
                this.ngRedux.dispatch({ type: 'REGISTRATION_FAIL', error });
                return Observable.throw(error);
            }))
            .pipe(map(payload => ({ type: 'REGISTER_USER_SUCCESS', payload })))
            .subscribe(action => this.ngRedux.dispatch(action));
    }

    getSecurityQuestions() {
        return this.Get(this.accountUrl + 'questions');
    }

    getRoles() {
        return this.AuthGet(this.accountUrl + 'roles/')
            .pipe(map(payload => ({ type: 'GET_USER_ROLES', payload })))
            .subscribe(action => this.ngRedux.dispatch(action));
    }

    getUsers() {
        return this.AuthGet(this.authAdminUrl + 'users');
    }

    getUser(userId: string) {
        return this.AuthGet(this.authAdminUrl + 'user/' + userId);
    }

    updateUserRoles(userId: string, userForm: any) {
        return this.AuthPut(this.authAdminUrl + 'user/' + userId + '/roles', userForm);
    }

    deleteUser(userId: string) {
        return this.AuthDelete(this.authAdminUrl + 'user/' + userId);
    }

    lockUser(userId: string, params: any) {
        return this.AuthPost(this.authAdminUrl + 'user/' + userId + '/lock', params);
    }

    unlockUser(userId: string) {
        return this.AuthPost(this.authAdminUrl + 'user/' + userId + '/unlock', null);
    }

    getAllRoles() {
        return this.AuthGet(this.authAdminUrl + 'roles');
    }

    addRole(roleName: string) {
        let roleData = {
            name: roleName
        };
        return this.AuthPost(this.authAdminUrl + 'role', roleData);
    }

    deleteRole(roleId: string) {
        return this.AuthDelete(this.authAdminUrl + 'role/' + roleId);
    }

    changePassword(changePasswordForm: any) {
        return this.AuthPost(this.accountUrl + 'changepassword', changePasswordForm);
    }

    startResetPassword(passwordResetStartForm: any) {
        return this.Post(this.accountUrl + 'resetpasswordstart', passwordResetStartForm);
    }

    resetPasswordQuestions(passwordResetQuestionsForm: any) {
        return this.Post(this.accountUrl + 'resetpasswordquestions', passwordResetQuestionsForm)
            .pipe(map<Object, any>(resp => this.extractData(resp, 'result')));
    }

    resetPassword(resetPasswordForm: any) {
        return this.Post(this.accountUrl + 'resetpassword', resetPasswordForm);
    }

    getCustomEvents() {
        return this.Get(this.eventsUrl);
    }

    getCustomEventsByGame(gameId: any) {
        return this.Get(this.eventsUrl + 'game/' + gameId);
    }

    getCustomEvent(eventId: any) {
        return this.Get(this.eventsUrl + eventId);
    }

    updateCustomEvent(eventId: string, event: any) {
        return this.AuthPut(this.eventsUrl + eventId, event);
    }

    createCustomEvent(event: any) {
        return this.AuthPost(this.eventsUrl, event);
    }

    getPS2AllServiceStatus() {
        return this.AuthGet(this.ps2Url + 'services/status');
    }

    getPS2ServiceStatus(service: string) {
        return this.AuthGet(this.ps2Url + 'services/' + service + '/status');
    }

    enablePS2Service(service: string, originator: string) {
        let url = `${this.ps2Url}services/${service}/enable${originator ? '?platform=' + originator : ''}`;
        return this.AuthPost(url, null);
    }

    disablePS2Service(service: string, originator: string) {
        let url = `${this.ps2Url}services/${service}/disable${originator ? '?platform=' + originator : ''}`;
        return this.AuthPost(url, null);
    }

    setupWorldZones(worldId: string) {
        return this.AuthPost(this.ps2Url + 'worldstate/' + worldId + '/zone', null);
    }

    getPSBAccountSessions() {
        return this.AuthGet(this.ps2Url + 'psb/sessions');
    }

    getAllClients() {
        return this.AuthGet(this.oidcAdminUrl + 'client');
    }

    getClientById(clientId: string) {
        return this.AuthGet(this.oidcAdminUrl + 'client/' + clientId);
    }

    getAllApiResources() {
        return this.AuthGet(this.oidcAdminUrl + 'resource');
    }

    getApiResourceById(resourceId: string) {
        return this.AuthGet(this.oidcAdminUrl + 'resource/' + resourceId);
    }
}