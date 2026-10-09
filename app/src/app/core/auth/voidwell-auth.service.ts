import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { EventTypes, LoginResponse, OidcSecurityService, PublicEventsService } from 'angular-auth-oidc-client';
import { LoadUserFailure, LoadUserSuccess, RenewTokenFailure, RenewTokenSuccess } from '../store/actions/auth.actions';
import { AppState } from '../store/app.states';
import { AuthUser } from './auth-user.model';

@Injectable()
export class VoidwellAuthService {
    private oidc = inject(OidcSecurityService);
    private events = inject(PublicEventsService);
    private store = inject<Store<AppState>>(Store);

    /**
     * Completes a pending sign-in redirect (if any), restores the stored session
     * and starts listening for token renewals. Runs before the first navigation.
     */
    initialize(): Observable<LoginResponse> {
        this.listenForTokenEvents();

        return this.oidc.checkAuth().pipe(
            tap(response => {
                if (response.isAuthenticated) {
                    this.store.dispatch(new LoadUserSuccess(this.toUser(response.accessToken, response.userData)));
                } else if (response.errorMessage) {
                    this.store.dispatch(new LoadUserFailure({ error: response.errorMessage }));
                }
            }));
    }

    signIn(): void {
        this.oidc.authorize();
    }

    signOut(): void {
        this.oidc.logoff().subscribe();
    }

    /** Called after a 401: refresh the session, or sign in again if that fails. */
    checkSession(): void {
        this.oidc.forceRefreshSession().subscribe({
            error: () => {
                this.oidc.logoffLocal();
                this.signIn();
            }
        });
    }

    private listenForTokenEvents(): void {
        this.events.registerForEvents().pipe(
            filter(event => event.type === EventTypes.NewAuthenticationResult),
            switchMap(() => this.currentUser())
        ).subscribe(user => {
            if (user) {
                this.store.dispatch(new RenewTokenSuccess(user));
            }
        });

        this.events.registerForEvents().pipe(
            filter(event => event.type === EventTypes.SilentRenewFailed)
        ).subscribe(() => {
            this.store.dispatch(new RenewTokenFailure(null));
            this.checkSession();
        });
    }

    private currentUser(): Observable<AuthUser | null> {
        return this.oidc.getAccessToken().pipe(
            switchMap(token => token
                ? this.oidc.getUserData().pipe(map(data => this.toUser(token, data)))
                : of(null)));
    }

    private toUser(accessToken: string, userData: { name?: string } | null): AuthUser {
        return { accessToken, name: userData?.name ?? '', roles: this.readRoles(accessToken) };
    }

    /** Reads the `roles` claim from the access token payload. The API validates the signature. */
    private readRoles(accessToken: string): string[] {
        try {
            const payload = accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const claims = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(payload), c => c.charCodeAt(0)))) as { roles?: string | string[] };
            return [claims.roles ?? []].flat();
        } catch {
            return [];
        }
    }
}
