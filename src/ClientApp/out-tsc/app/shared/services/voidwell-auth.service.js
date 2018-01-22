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
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
var router_1 = require("@angular/router");
var Observable_1 = require("rxjs/Observable");
require("rxjs/add/operator/take");
var store_1 = require("@angular-redux/store");
var reducers_1 = require("../../reducers");
var oidc_client_1 = require("oidc-client");
var voidwell_api_service_1 = require("./voidwell-api.service");
var VoidwellAuthService = (function () {
    function VoidwellAuthService(http, router, route, ngRedux, injector) {
        var _this = this;
        this.http = http;
        this.router = router;
        this.route = route;
        this.ngRedux = ngRedux;
        this.injector = injector;
        var authority;
        var redirectUri;
        var signInCallbackUri;
        var silentCallbackUri;
        authority = "http://auth.localdev.com/";
        redirectUri = location.origin + '/';
        signInCallbackUri = redirectUri + 'signInCallback.html';
        silentCallbackUri = redirectUri + 'silentCallback.html';
        oidc_client_1.Log.logger = console;
        oidc_client_1.Log.level = oidc_client_1.Log.WARN;
        var settings = {
            client_id: 'voidwell-clientui',
            authority: authority,
            response_type: 'id_token token',
            scope: 'openid email profile voidwell-api',
            redirect_uri: signInCallbackUri,
            post_logout_redirect_uri: redirectUri,
            silent_redirect_uri: silentCallbackUri,
            automaticSilentRenew: true
        };
        this.mgr = new oidc_client_1.UserManager(settings);
        this.mgr.clearStaleState().then(function () {
            oidc_client_1.Log.info('clearStateState success');
        }).catch(function (e) {
            oidc_client_1.Log.error('clearStateState error', e.message);
        });
        this.route.url.subscribe(function (url) {
            var currentRoute;
            currentRoute = location.pathname;
            _this.router.navigate([currentRoute]);
            _this.mgr.getUser()
                .then(function (user) {
                _this.ngRedux.subscribe(function () {
                    var state = ngRedux.getState();
                    if (state.loggedInUser && state.loggedInUser.user) {
                        _this.setAuthHeaders(state.loggedInUser.user);
                    }
                });
                _this.rolesState = _this.ngRedux.select(['loggedInUser', 'roles']);
                _this.rolesState.subscribe(function (userRoles) {
                    if (userRoles) {
                        _this.hasRoles(['Administrator']).subscribe(function (payload) {
                            _this.ngRedux.dispatch({ type: reducers_1.IS_ADMIN, payload: payload });
                        });
                    }
                });
                if (user) {
                    _this.ngRedux.dispatch({ type: reducers_1.LOAD_USER, user: user });
                    if (!_this.api) {
                        _this.api = _this.injector.get(voidwell_api_service_1.VoidwellApi);
                        _this.api.getRoles();
                    }
                    _this.router.navigate([currentRoute]);
                }
            })
                .catch(function (err) {
                _this.ngRedux.dispatch({ type: reducers_1.UNLOAD_USER });
            });
        });
        this.mgr.events.addUserLoaded(function (user) {
            _this.ngRedux.dispatch({ type: reducers_1.LOAD_USER, user: user });
        });
        this.mgr.events.addUserSignedOut(function (e) {
            _this.signOut();
        });
        this.mgr.events.addAccessTokenExpiring(function (e) {
            _this.ngRedux.dispatch({ type: reducers_1.RENEW_TOKEN });
        });
        this.mgr.events.addAccessTokenExpired(function (e) {
            _this.signOut();
        });
        this.mgr.events.addSilentRenewError(function (e) {
            _this.ngRedux.dispatch({ type: reducers_1.RENEW_TOKEN_FAILED });
            _this.signOut();
            throw new Error('Silent token renewal failed: ' + e.message);
        });
        //this.checkSession();
    }
    VoidwellAuthService.prototype.signIn = function () {
        this.mgr.signinRedirect().then(function () {
        }).catch(function (error) {
            return Observable_1.Observable.throw(error);
        });
    };
    VoidwellAuthService.prototype.signOut = function () {
        this.ngRedux.dispatch({ type: reducers_1.UNLOAD_USER });
        this.mgr.signoutRedirect().then(function () {
        }).catch(function (error) {
            return Observable_1.Observable.throw(error);
        });
    };
    ;
    VoidwellAuthService.prototype.checkSession = function () {
        var _this = this;
        this.mgr.querySessionStatus()
            .catch(function (e) {
            if (e['error'] === 'login_required') {
                _this.revokeSession();
            }
        });
    };
    VoidwellAuthService.prototype.revokeSession = function () {
        this.mgr.removeUser();
        this.signIn();
    };
    VoidwellAuthService.prototype.hasRoles = function (routeRoles) {
        var _this = this;
        this.userRoleState = this.ngRedux.select(['loggedInUser', 'roles']);
        return Observable_1.Observable.create(function (observer) {
            _this.userRoleState.subscribe(function (userRoles) {
                if (routeRoles) {
                    var found_1 = false;
                    routeRoles.forEach(function (role) {
                        if (userRoles && userRoles.indexOf(role) > -1) {
                            found_1 = true;
                        }
                    });
                    observer.next(found_1);
                }
                else {
                    observer.next(false);
                }
            });
        }).take(1);
    };
    VoidwellAuthService.prototype.getAuthHeaders = function () {
        return this.authHeaders;
    };
    ;
    VoidwellAuthService.prototype.setAuthHeaders = function (user) {
        this.authHeaders = new http_1.Headers();
        this.authHeaders.append('Authorization', user.token_type + ' ' + user.access_token);
        this.authHeaders.append('Content-Type', 'application/json');
    };
    return VoidwellAuthService;
}());
VoidwellAuthService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http,
        router_1.Router,
        router_1.ActivatedRoute,
        store_1.NgRedux,
        core_1.Injector])
], VoidwellAuthService);
exports.VoidwellAuthService = VoidwellAuthService;
