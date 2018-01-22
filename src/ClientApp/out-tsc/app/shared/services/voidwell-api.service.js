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
require("rxjs/add/observable/throw");
var http_1 = require("@angular/http");
var store_1 = require("@angular-redux/store");
var core_1 = require("@angular/core");
var voidwell_auth_service_1 = require("../services/voidwell-auth.service");
var VoidwellApi = (function () {
    function VoidwellApi(authService, http, ngRedux) {
        this.authService = authService;
        this.http = http;
        this.ngRedux = ngRedux;
        this.apiBaseUrl = 'app/';
        this.blogUrl = location.origin + '/api/blog/';
        this.eventsUrl = location.origin + '/api/events/';
        this.accountUrl = location.origin + '/api/account/';
        this.authAdminUrl = location.origin + '/api/authadmin/';
        this._requestTimeout = 30000;
        this._requestTimeoutMessage = 'Request timed out';
        this.options = new http_1.RequestOptions({ headers: this.authService.getAuthHeaders() });
    }
    VoidwellApi.prototype.getAllBlogPosts = function () {
        var _this = this;
        return this.http.get(this.blogUrl, this.options)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        });
    };
    VoidwellApi.prototype.getBlogPost = function (blogPostId) {
        var _this = this;
        return this.http.get(this.blogUrl + blogPostId, this.options)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        });
    };
    VoidwellApi.prototype.createBlogPost = function (blogPost) {
        var _this = this;
        return this.AuthPost(this.blogUrl, blogPost, this.options)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        });
    };
    VoidwellApi.prototype.updateBlogPost = function (blogPost) {
        var _this = this;
        return this.AuthPut(this.blogUrl, blogPost, this.options)
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        });
    };
    VoidwellApi.prototype.deleteBlogPost = function (blogPostId) {
        var _this = this;
        return this.AuthDelete(this.blogUrl + blogPostId, this.options)
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        });
    };
    VoidwellApi.prototype.accountRegister = function (registrationForm) {
        var _this = this;
        this.ngRedux.dispatch({ type: 'REGISTER_USER' });
        return this.http.post(this.accountUrl + 'register', registrationForm, this.options)
            .map(function (resp) { return resp.ok ? null : resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'REGISTRATION_FAIL', error: error });
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        })
            .map(function (payload) { return ({ type: 'REGISTER_USER_SUCCESS', payload: payload }); })
            .subscribe(function (action) { return _this.ngRedux.dispatch(action); });
    };
    VoidwellApi.prototype.getSecurityQuestions = function () {
        var _this = this;
        return this.http.get(this.accountUrl + 'questions', this.options)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'SECURITY_QUESTIONS_FAIL' });
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        });
    };
    VoidwellApi.prototype.getRoles = function () {
        var _this = this;
        return this.AuthGet(this.accountUrl + 'roles/', this.options)
            .map(function (resp) { return resp.json(); })
            .catch(function (res) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', res: res });
            return _this.handleError(res);
        })
            .map(function (payload) { return ({ type: 'GET_USER_ROLES', payload: payload }); })
            .subscribe(function (action) { return _this.ngRedux.dispatch(action); });
        ;
    };
    VoidwellApi.prototype.getUsers = function () {
        var _this = this;
        return this.AuthGet(this.authAdminUrl + 'users', this.options)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        });
    };
    VoidwellApi.prototype.getUser = function (userId) {
        var _this = this;
        return this.AuthGet(this.authAdminUrl + 'user/' + userId, this.options)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        });
    };
    VoidwellApi.prototype.updateUserRoles = function (userId, userForm) {
        var _this = this;
        return this.AuthPut(this.authAdminUrl + 'user/' + userId + '/roles', userForm, this.options)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        });
    };
    VoidwellApi.prototype.deleteUser = function (userId) {
        var _this = this;
        return this.AuthDelete(this.authAdminUrl + 'user/' + userId, this.options)
            .map(function (resp) { return resp.ok ? null : resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        });
    };
    VoidwellApi.prototype.getAllRoles = function () {
        var _this = this;
        return this.AuthGet(this.authAdminUrl + 'roles', this.options)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        });
    };
    VoidwellApi.prototype.addRole = function (roleName) {
        var _this = this;
        var roleData = {
            name: roleName
        };
        return this.AuthPost(this.authAdminUrl + 'role', roleData, this.options)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        });
    };
    VoidwellApi.prototype.deleteRole = function (roleId) {
        var _this = this;
        return this.AuthDelete(this.authAdminUrl + 'role/' + roleId, this.options)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        });
    };
    VoidwellApi.prototype.changePassword = function (changePasswordForm) {
        var _this = this;
        return this.AuthPost(this.accountUrl + 'changepassword', changePasswordForm, this.options)
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        });
    };
    VoidwellApi.prototype.startResetPassword = function (passwordResetStartForm) {
        var _this = this;
        return this.http.post(this.accountUrl + 'resetpasswordstart', passwordResetStartForm, this.options)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        });
    };
    VoidwellApi.prototype.resetPasswordQuestions = function (passwordResetQuestionsForm) {
        var _this = this;
        return this.http.post(this.accountUrl + 'resetpasswordquestions', passwordResetQuestionsForm, this.options)
            .map(function (resp) { return _this.extractData(resp, 'result'); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        });
    };
    VoidwellApi.prototype.resetPassword = function (resetPasswordForm) {
        var _this = this;
        return this.http.post(this.accountUrl + 'resetpassword', resetPasswordForm, this.options)
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        });
    };
    VoidwellApi.prototype.getCustomEvents = function () {
        var _this = this;
        return this.http.get(this.eventsUrl, this.options)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        });
    };
    VoidwellApi.prototype.getCustomEventsByGame = function (gameId) {
        var _this = this;
        return this.http.get(this.eventsUrl + 'game/' + gameId, this.options)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        });
    };
    VoidwellApi.prototype.getCustomEvent = function (eventId) {
        var _this = this;
        return this.http.get(this.eventsUrl + eventId, this.options)
            .map(function (resp) { return resp.json(); })
            .catch(function (error) {
            _this.ngRedux.dispatch({ type: 'LOG_ERROR_MESSAGE', error: error });
            return _this.handleError(error);
        });
    };
    VoidwellApi.prototype.handleError = function (error) {
        this.checkAuthorization(error);
        return Observable_1.Observable.throw(error);
    };
    VoidwellApi.prototype.checkAuthorization = function (error) {
        if (error.status === 401) {
            this.authService.checkSession();
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
    __metadata("design:paramtypes", [voidwell_auth_service_1.VoidwellAuthService,
        http_1.Http,
        store_1.NgRedux])
], VoidwellApi);
exports.VoidwellApi = VoidwellApi;
