import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { catchError, map, exhaustMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { AuthActionTypes, LoadUserRoles, LoadUserRolesFailure, LoadUserRolesSuccess } from '../actions/auth.actions';

import { VoidwellAuthService } from '../../shared/services/voidwell-auth.service'
import { VoidwellApi } from '../../shared/services/voidwell-api.service'

@Injectable()
export class AuthEffects {
    constructor(
        private actions: Actions,
        private authService: VoidwellAuthService,
        private api: VoidwellApi
    ) { }

    @Effect({ dispatch: false })
    LogInUser: Observable<any> = this.actions.pipe(
        ofType(AuthActionTypes.LOG_IN_USER),
        map(() => this.authService.signIn()));

    @Effect()
    LoadUserSuccess: Observable<any> = this.actions.pipe(
        ofType(AuthActionTypes.LOAD_USER_SUCCESS),
        map(() => new LoadUserRoles()));

    @Effect()
    LoadUserRoles: Observable<any> = this.actions.pipe(
        ofType(AuthActionTypes.LOAD_USER_ROLES),
        exhaustMap(() =>
            this.api.getRoles().pipe(
                catchError(error => of(new LoadUserRolesFailure({ error: error }))),
                map((roles: string[]) => new LoadUserRolesSuccess(roles)))
            )
        );

    @Effect({ dispatch: false })
    LogOutUser: Observable<any> = this.actions.pipe(
        ofType(AuthActionTypes.LOG_OUT_USER),
        map(() => this.authService.signOut()));
}