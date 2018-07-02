import { Injectable, Injector } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, Observable, throwError } from 'rxjs';
import { take } from 'rxjs/operators';
import { NgRedux } from '@angular-redux/store';
import { UserManager, UserManagerSettings, Log } from 'oidc-client';
import { IAppState } from '../../app.component';
import { LOAD_USER, UNLOAD_USER, RENEW_TOKEN, RENEW_TOKEN_FAILED, IS_ADMIN } from '../../reducers';
import { VoidwellApi } from './voidwell-api.service';

@Injectable()
export class VoidwellAuthService {
    mgr: UserManager;
    userRoleState: Observable<any>;
    rolesState: Observable<any>;

    private api: any;
    private authHeaders: Headers;

    constructor(private http: Http,
        private router: Router,
        private route: ActivatedRoute,
        private ngRedux: NgRedux<IAppState>,
        private injector: Injector) {
        
        let redirectUri = location.origin + '/';
        let signInCallbackUri = redirectUri + 'signInCallback.html';
        let silentCallbackUri = redirectUri + 'silentCallback.html';

        Log.logger = console;
        Log.level = Log.WARN;

        const settings: UserManagerSettings = {
            client_id: 'voidwell-clientui',
            authority: location.protocol + '//auth.' + location.host,
            response_type: 'id_token token',
            scope: 'openid email profile voidwell-api',
            redirect_uri: signInCallbackUri,
            post_logout_redirect_uri: redirectUri,
            silent_redirect_uri: silentCallbackUri,
            automaticSilentRenew: true
        };
        this.mgr = new UserManager(settings);
        this.mgr.clearStaleState().then(function () {
            Log.info('clearStateState success');
        }).catch(function (e) {
            Log.error('clearStateState error', e.message);
        });

        this.route.url.subscribe(url => {
            let currentRoute = location.pathname;

            this.router.navigate([currentRoute]);

            this.mgr.getUser()
                .then((user) => {

                    this.ngRedux.subscribe(() => {
                        const state = ngRedux.getState();
                        if (state.loggedInUser && state.loggedInUser.user) {
                            this.setAuthHeaders(state.loggedInUser.user);
                        }
                    });

                    this.rolesState = this.ngRedux.select(['loggedInUser', 'roles']);
                    this.rolesState.subscribe(userRoles => {
                        if (userRoles) {
                            this.hasRoles(['Administrator']).subscribe(payload => {
                                this.ngRedux.dispatch({ type: IS_ADMIN, payload });
                            });
                        }
                    });

                    if (user) {
                        this.ngRedux.dispatch({ type: LOAD_USER, user });
                        if (!this.api) {
                            this.api = this.injector.get(VoidwellApi);
                            this.api.getRoles();
                        }

                        this.router.navigate([currentRoute]);
                    }
                })
                .catch((err) => {
                    this.ngRedux.dispatch({ type: UNLOAD_USER });
                });
        });

        this.mgr.events.addUserLoaded((user) => {
            this.ngRedux.dispatch({ type: LOAD_USER, user });
        });

        this.mgr.events.addUserSignedOut((e) => {
            this.signOut();
        });

        this.mgr.events.addAccessTokenExpiring((e) => {
            this.ngRedux.dispatch({ type: RENEW_TOKEN });
        });

        this.mgr.events.addAccessTokenExpired((e) => {
            this.signOut();
        });

        this.mgr.events.addSilentRenewError((e) => {
            this.checkSession();
        });
    }

    signIn() {
        this.mgr.signinRedirect().then(function () {
        }).catch(function (error) {
            return throwError(error);
        });
    }

    signOut() {
        localStorage.removeItem('voidwell-auth-redirect');

        this.ngRedux.dispatch({ type: UNLOAD_USER });
        this.mgr.signoutRedirect().then(function () {
        }).catch(function (error) {
            return throwError(error);
        });
    };

    checkSession() {
        this.mgr.querySessionStatus()
            .catch((e: Error) => {
                if (e['error'] === 'login_required') {
                    this.revokeSession();
                }
            });
    }

    revokeSession() {
        this.mgr.removeUser().then(() => {
            this.signIn();
        }).catch(function (error) {
            return throwError(error);
        });
    }

    hasRoles(routeRoles: string[]): Observable<boolean> {
        this.userRoleState = this.ngRedux.select(['loggedInUser', 'roles']);
        return Observable.create((observer: Subject<boolean>) => {
            this.userRoleState.subscribe(userRoles => {
                if (routeRoles && userRoles) {
                    let found = false;
                    routeRoles.forEach(role => {
                        if (userRoles && userRoles.indexOf(role) > -1) {
                            found = true;
                        }
                    });
                    observer.next(found);
                }
            });
        }).pipe(take(1));
    }

    getAuthHeaders() {
        return this.authHeaders;
    };

    private setAuthHeaders(user: any) {
        this.authHeaders = new Headers();
        this.authHeaders.append('Authorization', user.token_type + ' ' + user.access_token);
        this.authHeaders.append('Content-Type', 'application/json');
    }
}