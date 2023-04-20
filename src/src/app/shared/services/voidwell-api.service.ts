import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VoidwellAuthService } from './../services/voidwell-auth.service';
import { ApiBase } from './api-base';
import { RequestCache } from './../services/request-cache.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.states';

@Injectable()
export class VoidwellApi extends ApiBase {
    apiBaseUrl = 'app/';
    apiRoot = `${location.protocol}//api.${location.host}`
    public blogUrl = `${this.apiRoot}/blog/`;
    public eventsUrl = `${this.apiRoot}/events/`;
    public accountUrl = `${this.apiRoot}/account/`;
    public authAdminUrl = `${this.apiRoot}/authadmin/`;
    public oidcAdminUrl = `${this.apiRoot}/oidcadmin/`;
    public ps2Url = `${this.apiRoot}/ps2/`;

    constructor(public authService: VoidwellAuthService,
        public http: HttpClient,
        public cache: RequestCache,
        public store: Store<AppState>) {
        super(authService, http, cache, store);
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
        return this.Post(this.accountUrl + 'register', registrationForm);
    }

    getSecurityQuestions() {
        return this.Get(this.accountUrl + 'questions');
    }

    getRoles() {
        return this.AuthGet(this.accountUrl + 'roles/');
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

    getPS2StoreLogs() {
        return this.AuthGet(`${this.ps2Url}store/updatelog`);
    }

    refreshPS2Store(store: string, originator: string) {
        let url = `${this.ps2Url}store/update/${store}${originator ? '?platform=' + originator : ''}`;
        return this.AuthPost(url, null);
    }

    setupWorldZones(worldId: string) {
        return this.AuthPost(this.ps2Url + 'worldstate/' + worldId + '/zone', null);
    }

    getPSBAccountSessions() {
        return this.AuthGet(this.ps2Url + 'psb/sessions');
    }

    getAllClients(search: string = '', page: number = 1) {
        return this.AuthGet(`${this.oidcAdminUrl}client?search=${search}&page=${page}`);
    }

    getClientById(clientId: string) {
        return this.AuthGet(this.oidcAdminUrl + 'client/' + clientId);
    }

    createClient(clientConfig: any) {
        return this.AuthPost(this.oidcAdminUrl + 'client', clientConfig);
    }

    updateClientById(clientId: string, clientConfig: any) {
        return this.AuthPut(this.oidcAdminUrl + 'client/' + clientId, clientConfig);
    }

    deleteClientById(clientId: string) {
        return this.AuthDelete(this.oidcAdminUrl + 'client/' + clientId);
    }

    getClientSecrets(clientId: string) {
        return this.AuthGet(`${this.oidcAdminUrl}client/${clientId}/secret`);
    }
    
    createClientSecret(clientId: string, secretConfig: any) {
        return this.AuthPost(`${this.oidcAdminUrl}client/${clientId}/secret`, secretConfig);
    }

    deleteClientSecret(clientId: string, secretId: string) {
        return this.AuthDelete(`${this.oidcAdminUrl}client/${clientId}/secret/${secretId}`);
    }

    getAllApiResources(search: string = '', page: number = 1) {
        return this.AuthGet(`${this.oidcAdminUrl}resource?search=${search}&page=${page}`);
    }

    getApiResourceById(resourceId: string) {
        return this.AuthGet(this.oidcAdminUrl + 'resource/' + resourceId);
    }

    createApiResource(resourceConfig: any) {
        return this.AuthPost(this.oidcAdminUrl + 'resource', resourceConfig);
    }

    updateApiResourceById(resourceId: string, resourceConfig: any) {
        return this.AuthPut(this.oidcAdminUrl + 'resource/' + resourceId, resourceConfig);
    }

    deleteApiResourceById(resourceId: string) {
        return this.AuthDelete(this.oidcAdminUrl + 'resource/' + resourceId);
    }

    getApiResourceSecrets(resourceId: string) {
        return this.AuthGet(`${this.oidcAdminUrl}resource/${resourceId}/secret`);
    }

    createApiResourceSecret(resourceId: string, secretConfig: any) {
        return this.AuthPost(`${this.oidcAdminUrl}resource/${resourceId}/secret`, secretConfig);
    }

    deleteApiResourceSecret(resourceId: string, secretId: string) {
        return this.AuthDelete(`${this.oidcAdminUrl}resource/${resourceId}/secret/${secretId}`);
    }
}