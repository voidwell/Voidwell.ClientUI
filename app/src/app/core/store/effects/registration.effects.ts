import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { RegisterUser, RegistrationActionTypes, RegistrationSuccess, RegistrationFailure } from '../actions/registration.actions';
import { AccountRepository } from '../../api/auth/account.repository';

@Injectable()
export class RegistrationEffects {
    private actions = inject(Actions);
    private accountRepository = inject(AccountRepository);

    RegisterUser = createEffect(() => this.actions.pipe(
        ofType(RegistrationActionTypes.REGISTER_USER),
        switchMap((action: RegisterUser) =>
            this.accountRepository.register(action.payload.registrationForm).pipe(
                map((data) => new RegistrationSuccess(data)),
                catchError(error => of(new RegistrationFailure({ error: error }))))
        )));
}
