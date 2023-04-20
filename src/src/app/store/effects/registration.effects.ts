import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { RegistrationActionTypes, RegistrationSuccess, RegistrationFailure } from '../actions/registration.actions';
import { VoidwellApi } from '../../shared/services/voidwell-api.service'

@Injectable()
export class RegistrationEffects {
    constructor(
        private actions: Actions,
        private api: VoidwellApi
    ) { }

    @Effect()
    RegisterUser: Observable<any> = this.actions.pipe(
        ofType(RegistrationActionTypes.REGISTER_USER),
        map((action: any) => {
            this.api.accountRegister(action.payload.registrationForm).pipe(
                catchError(error => of(new RegistrationFailure({ error: error }))),
                map((data) => new RegistrationSuccess(data))
            );
        }));
}