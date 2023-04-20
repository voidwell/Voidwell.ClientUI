import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { AppState, selectAuthState } from '../../store/app.states';

@Injectable()
export class VoidwellAuthGuard implements CanActivate {

    constructor(private store: Store<AppState>) {
        this.store.select(selectAuthState)
            .subscribe((state) => {
                this.isAuthenticated = state.isAuthenticated;
                this.userRoles = state.userRoles;
            });
    }

    isAuthenticated : boolean = false;
    userRoles: string[] = [];

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        localStorage.setItem('voidwell-auth-redirect', state.url);

        let guestOnly = route.data['guestOnly'] as boolean;
        if (guestOnly) {
            if (this.isAuthenticated) {
                return of(false);
            }
            return of(true);
        }

        let routeRoles = route.data['roles'] as Array<string>;
        if (this.isAuthenticated) {
            if (routeRoles) {
                return of(this.hasRoles(routeRoles));
            }
            return of(true);
        }
        return of(false);
    }

    private hasRoles(routeRoles: string[]): boolean{
        if (routeRoles && this.userRoles) {
            let found = false;
            routeRoles.forEach(role => {
                if (this.userRoles.indexOf(role) > -1) {
                    found = true;
                }
            });
            return found;
        }
        return false;
    }
}