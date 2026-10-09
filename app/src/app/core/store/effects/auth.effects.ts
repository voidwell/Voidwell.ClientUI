import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import { AuthActionTypes } from '../actions/auth.actions';

import { VoidwellAuthService } from '../../auth/voidwell-auth.service';

@Injectable()
export class AuthEffects {
    private actions = inject(Actions);
    private authService = inject(VoidwellAuthService);

    LogInUser = createEffect(() => this.actions.pipe(
        ofType(AuthActionTypes.LOG_IN_USER),
        map(() => this.authService.signIn())),
        { dispatch: false });

    RegisterUser = createEffect(() => this.actions.pipe(
        ofType(AuthActionTypes.REGISTER_USER),
        map(() => this.authService.register())),
        { dispatch: false });

    LogOutUser = createEffect(() => this.actions.pipe(
        ofType(AuthActionTypes.LOG_OUT_USER),
        map(() => this.authService.signOut())),
        { dispatch: false });
}
