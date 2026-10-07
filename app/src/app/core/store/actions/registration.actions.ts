import { Action } from '@ngrx/store';
import { RegistrationForm } from '../../api/models/auth/account.model';

export enum RegistrationActionTypes {
    REGISTER_USER = '[Registration] REGISTER_USER',
    REGISTRATION_FAILURE = '[Registration] REGISTRATION_FAILURE',
    REGISTRATION_SUCCESS = '[Registration] REGISTRATION_SUCCESS'
}

export class RegisterUser implements Action {
    readonly type = RegistrationActionTypes.REGISTER_USER;
    constructor(public payload: { registrationForm: RegistrationForm }) { }
}

export class RegistrationSuccess implements Action {
    readonly type = RegistrationActionTypes.REGISTRATION_SUCCESS;
    constructor(public payload: unknown) { }
}

export class RegistrationFailure implements Action {
    readonly type = RegistrationActionTypes.REGISTRATION_FAILURE;
    constructor(public payload: { error: unknown }) { }
}

export type RegistrationActions =
    | RegisterUser
    | RegistrationSuccess
    | RegistrationFailure;