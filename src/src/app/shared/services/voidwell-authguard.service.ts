import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { NgRedux } from '@angular-redux/store';
import { Observable, of } from 'rxjs';
import { IAppState } from '../../app.component';
import { VoidwellApi } from './voidwell-api.service';
import { VoidwellAuthService } from './voidwell-auth.service';

@Injectable()
export class VoidwellAuthGuard implements CanActivate {

    constructor(private ngRedux: NgRedux<IAppState>, private router: Router, private api: VoidwellApi,
        private authService: VoidwellAuthService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        localStorage.setItem('voidwell-auth-redirect', state.url);

        let guestOnly = route.data['guestOnly'] as boolean;
        if (guestOnly) {
            if (this.ngRedux.getState().loggedInUser && this.ngRedux.getState().loggedInUser.isLoggedIn) {
                return of(false);
            }
            return of(true);
        }

        let roles = route.data['roles'] as Array<string>;
        if (this.ngRedux.getState().loggedInUser && this.ngRedux.getState().loggedInUser.isLoggedIn) {
            if (roles) {
                return this.authService.hasRoles(roles);
            }
            return of(true);
        }
        return of(false);
    }
}