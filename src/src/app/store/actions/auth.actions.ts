import { Action } from '@ngrx/store';
import { User } from 'oidc-client';

export enum AuthActionTypes {
    LOG_IN_USER = '[Auth] LOG_IN_USER',
    LOAD_USER_SUCCESS = '[Auth] LOAD_USER_SUCCESS',
    LOAD_USER_FAILURE = '[Auth] LOAD_USER_FAILURE',
    LOG_OUT_USER = '[Auth] LOG_OUT_USER',
    RENEW_TOKEN = '[Auth] RENEW_TOKEN',
    RENEW_TOKEN_SUCCESS = '[Auth] RENEW_TOKEN_SUCCESS',
    RENEW_TOKEN_FAILURE = '[Auth] RENEW_TOKEN_FAILURE',
    LOAD_USER_ROLES = '[Auth] LOAD_USER_ROLES',
    LOAD_USER_ROLES_SUCCESS = '[Auth] LOAD_USER_ROLES_SUCCESS',
    LOAD_USER_ROLES_FAILURE = '[Auth] LOAD_USER_ROLES_FAILURE'
}

export class LogInUser implements Action {
    readonly type = AuthActionTypes.LOG_IN_USER;
}

export class LoadUserSuccess implements Action {
    readonly type = AuthActionTypes.LOAD_USER_SUCCESS;
    constructor(public payload: User ) { }
}

export class LoadUserFailure implements Action {
    readonly type = AuthActionTypes.LOAD_USER_FAILURE;
    constructor(public payload: { error: any }) { }
}

export class LogOutUser implements Action {
    readonly type = AuthActionTypes.LOG_OUT_USER;
}

export class RenewToken implements Action {
    readonly type = AuthActionTypes.RENEW_TOKEN;
}

export class RenewTokenSuccess implements Action {
    readonly type = AuthActionTypes.RENEW_TOKEN_SUCCESS;
    constructor(public payload: User ) { }
}

export class RenewTokenFailure implements Action {
    readonly type = AuthActionTypes.RENEW_TOKEN_FAILURE;
    constructor(public payload: any ) { }
}

export class LoadUserRoles implements Action {
    readonly type = AuthActionTypes.LOAD_USER_ROLES;
}

export class LoadUserRolesSuccess implements Action {
    readonly type = AuthActionTypes.LOAD_USER_ROLES_SUCCESS;
    constructor(public payload: string[]) { }
}

export class LoadUserRolesFailure implements Action {
    readonly type = AuthActionTypes.LOAD_USER_ROLES_FAILURE;
    constructor(public payload: { error: any }) { }
}

export type AuthActions =
    | LogInUser
    | LoadUserSuccess
    | LoadUserFailure
    | LogOutUser
    | RenewToken
    | RenewTokenSuccess
    | RenewTokenFailure
    | LoadUserRoles
    | LoadUserRolesSuccess
    | LoadUserRolesFailure;