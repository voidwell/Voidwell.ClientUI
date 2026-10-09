import { Action } from '@ngrx/store';
import { AuthUser } from '../../auth/auth-user.model';

export enum AuthActionTypes {
    LOG_IN_USER = '[Auth] LOG_IN_USER',
    LOAD_USER_SUCCESS = '[Auth] LOAD_USER_SUCCESS',
    LOAD_USER_FAILURE = '[Auth] LOAD_USER_FAILURE',
    LOG_OUT_USER = '[Auth] LOG_OUT_USER',
    RENEW_TOKEN = '[Auth] RENEW_TOKEN',
    RENEW_TOKEN_SUCCESS = '[Auth] RENEW_TOKEN_SUCCESS',
    RENEW_TOKEN_FAILURE = '[Auth] RENEW_TOKEN_FAILURE'
}

export class LogInUser implements Action {
    readonly type = AuthActionTypes.LOG_IN_USER;
}

export class LoadUserSuccess implements Action {
    readonly type = AuthActionTypes.LOAD_USER_SUCCESS;
    constructor(public payload: AuthUser) { }
}

export class LoadUserFailure implements Action {
    readonly type = AuthActionTypes.LOAD_USER_FAILURE;
    constructor(public payload: { error: unknown }) { }
}

export class LogOutUser implements Action {
    readonly type = AuthActionTypes.LOG_OUT_USER;
}

export class RenewToken implements Action {
    readonly type = AuthActionTypes.RENEW_TOKEN;
}

export class RenewTokenSuccess implements Action {
    readonly type = AuthActionTypes.RENEW_TOKEN_SUCCESS;
    constructor(public payload: AuthUser) { }
}

export class RenewTokenFailure implements Action {
    readonly type = AuthActionTypes.RENEW_TOKEN_FAILURE;
    constructor(public payload: unknown) { }
}

export type AuthActions =
    | LogInUser
    | LoadUserSuccess
    | LoadUserFailure
    | LogOutUser
    | RenewToken
    | RenewTokenSuccess
    | RenewTokenFailure;