import { Action } from '@ngrx/store';

export enum RegistrationActionTypes {
    REGISTER_USER = '[Registration] REGISTER_USER',
    REGISTRATION_FAILURE = '[Registration] REGISTRATION_FAILURE',
    REGISTRATION_SUCCESS = '[Registration] REGISTRATION_SUCCESS'
}

export class RegisterUser implements Action {
    readonly type = RegistrationActionTypes.REGISTER_USER;
    constructor(public payload: { registrationForm: any }) { }
}

export class RegistrationSuccess implements Action {
    readonly type = RegistrationActionTypes.REGISTRATION_SUCCESS;
    constructor(public payload: any) { }
}

export class RegistrationFailure implements Action {
    readonly type = RegistrationActionTypes.REGISTRATION_FAILURE;
    constructor(public payload: { error: any }) { }
}

export type RegistrationActions =
    | RegisterUser
    | RegistrationSuccess
    | RegistrationFailure;