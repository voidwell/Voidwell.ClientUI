"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/observable/of");
require("rxjs/add/operator/timeout");
require("rxjs/add/operator/catch");
//import { IpreoAccountAuthService } from '../services/ipreoaccount-auth.service';
var http_1 = require("@angular/http");
var store_1 = require("@angular-redux/store");
var core_1 = require("@angular/core");
var VoidwellApi = (function () {
    function VoidwellApi(//public authService: IpreoAccountAuthService,
        http, ngRedux) {
        this.http = http;
        this.ngRedux = ngRedux;
        this.apiBaseUrl = 'app/';
        this.blogUrl = location.origin + '/api/vw/blog/';
        this.authUrl = location.origin + '/api/auth/';
        this._requestTimeout = 30000;
        this._requestTimeoutMessage = 'Request timed out';
        this.options = new http_1.RequestOptions();
    }
    VoidwellApi.prototype.getAllBlogPosts = function () {
        var _this = this;
        this.ngRedux.dispatch({ type: 'GET_BLOG_POSTS' });
        var payload = [
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
        this.ngRedux.dispatch({ type: 'GET_BLOG_POSTS_SUCCESS', payload: payload });
        return this.http.get(this.blogUrl, this.options)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'BLOG_POSTS_FAIL' });
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        })
            .map(function (payload) { return ({ type: 'GET_BLOG_POSTS_SUCCESS', payload: payload }); })
            .subscribe(function (action) { return _this.ngRedux.dispatch(action); });
    };
    VoidwellApi.prototype.getBlogPost = function (blogPostId) {
        var _this = this;
        this.ngRedux.dispatch({ type: 'GET_BLOG_POST' });
        return this.http.get(this.blogUrl + blogPostId, this.options)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'BLOG_POST_FAIL' });
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        })
            .map(function (payload) { return ({ type: 'GET_BLOG_POST_SUCCESS', payload: payload }); })
            .subscribe(function (action) { return _this.ngRedux.dispatch(action); });
    };
    VoidwellApi.prototype.accountRegister = function (registrationForm) {
        var _this = this;
        this.ngRedux.dispatch({ type: 'REGISTER_USER' });
        return this.http.post(this.authUrl + 'register', registrationForm, this.options)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'REGISTRATION_FAIL' });
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        })
            .map(function (payload) { return ({ type: 'REGISTER_USER_SUCCESS', payload: payload }); })
            .subscribe(function (action) { return _this.ngRedux.dispatch(action); });
    };
    VoidwellApi.prototype.accoutLogin = function (loginForm) {
        var _this = this;
        this.ngRedux.dispatch({ type: 'LOGIN_USER' });
        return this.http.post(this.authUrl + 'login', loginForm, this.options)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOGIN_FAIL' });
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        })
            .map(function (payload) { return ({ type: 'LOGIN_USER_SUCCESS', payload: payload }); })
            .subscribe(function (action) { return _this.ngRedux.dispatch(action); });
    };
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
    VoidwellApi.prototype.handleError = function (error) {
        this.checkAuthorization(error);
        return Observable_1.Observable.throw(error);
    };
    VoidwellApi.prototype.checkAuthorization = function (error) {
        if (error.status === 401) {
            //this.authService.checkSession();
        }
    };
    VoidwellApi.prototype.AuthGet = function (url, options) {
        return this.http.get(url, options).timeout(this._requestTimeout);
    };
    VoidwellApi.prototype.AuthPost = function (url, data, options) {
        return this.http.post(url, data, options).timeout(this._requestTimeout);
    };
    VoidwellApi.prototype.AuthPut = function (url, data, options) {
        return this.http.put(url, data, options).timeout(this._requestTimeout);
    };
    VoidwellApi.prototype.AuthDelete = function (url, options) {
        return this.http.delete(url, options).timeout(this._requestTimeout);
    };
    VoidwellApi.prototype.extractData = function (res, key) {
        var body = res.json();
        if (key) {
            return body[key];
        }
        return body.data || {};
    };
    return VoidwellApi;
}());
VoidwellApi = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http,
        store_1.NgRedux])
], VoidwellApi);
exports.VoidwellApi = VoidwellApi;
