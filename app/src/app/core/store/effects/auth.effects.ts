import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, exhaustMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthActionTypes, LoadUserRoles, LoadUserRolesFailure, LoadUserRolesSuccess } from '../actions/auth.actions';

import { VoidwellAuthService } from '../../auth/voidwell-auth.service';
import { AccountRepository } from '../../api/auth/account.repository';

@Injectable()
export class AuthEffects {
    private actions = inject(Actions);
    private authService = inject(VoidwellAuthService);
    private accountRepository = inject(AccountRepository);

    LogInUser = createEffect(() => this.actions.pipe(
        ofType(AuthActionTypes.LOG_IN_USER),
        map(() => this.authService.signIn())),
        { dispatch: false });

    LoadUserSuccess = createEffect(() => this.actions.pipe(
        ofType(AuthActionTypes.LOAD_USER_SUCCESS),
        map(() => new LoadUserRoles())));

    LoadUserRoles = createEffect(() => this.actions.pipe(
        ofType(AuthActionTypes.LOAD_USER_ROLES),
        exhaustMap(() =>
            this.accountRepository.getUserRoles().pipe(
                catchError(error => of(new LoadUserRolesFailure({ error: error }))),
                map((roles: string[]) => new LoadUserRolesSuccess(roles)))
            )
        ));

    LogOutUser = createEffect(() => this.actions.pipe(
        ofType(AuthActionTypes.LOG_OUT_USER),
        map(() => this.authService.signOut())),
        { dispatch: false });
}
