import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { Store } from '@ngrx/store';
import { UserManager, UserManagerSettings, Log } from 'oidc-client';
import { LoadUserFailure, LoadUserSuccess, RenewToken } from '../../store/actions/auth.actions';
import { AppState } from '../../store/app.states';

@Injectable()
export class VoidwellAuthService {
    mgr: UserManager;
    userRoleState: Observable<any>;
    rolesState: Observable<any>;

    constructor(private router: Router,
        private route: ActivatedRoute,
        private store: Store<AppState>) {
        
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

            this.mgr.getUser()
                .then((user) => {
                    if (user) {
                        this.store.dispatch(new LoadUserSuccess(user));

                        this.router.navigate([currentRoute], { queryParams: route.snapshot.queryParams });
                    }
                })
                .catch((err) => {
                    this.store.dispatch(new LoadUserFailure({ error: err }));
                });
        });

        this.mgr.events.addUserLoaded((user) => {
            this.store.dispatch(new LoadUserSuccess(user));
        });

        this.mgr.events.addUserSignedOut(() => {
            this.signOut();
        });

        this.mgr.events.addAccessTokenExpiring((e) => {
            this.store.dispatch(new RenewToken());
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
}