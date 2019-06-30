export const LOAD_USER = 'LOAD_USER';
export const UNLOAD_USER = 'UNLOAD_USER';
export const RENEW_TOKEN = 'RENEW_TOKEN';
export const RENEW_TOKEN_FAILED = 'RENEW_TOKEN_FAILED';
export const GET_USER_ROLES = 'GET_USER_ROLES';
export const IS_ADMIN = 'IS_ADMIN';

export interface IUserLoginState {
    user: any;
    isLoggedIn: boolean;
    isAdmin: boolean;
    roles: string[];
};

export const initialLoginState: IUserLoginState = {
    user: null,
    isLoggedIn: false,
    isAdmin: false,
    roles: []
};

export const loginReducer = (state = initialLoginState, action): IUserLoginState => {
    switch (action.type) {
        case LOAD_USER:
            return Object.assign({}, state, { user: action.user, isLoggedIn: true });
        case UNLOAD_USER:
        case RENEW_TOKEN_FAILED:
            return Object.assign({}, state, { user: null, isLoggedIn: false });
        case RENEW_TOKEN:
            return state;
        case GET_USER_ROLES:
            return Object.assign({}, state, { roles: action.payload });
        case IS_ADMIN:
            return Object.assign({}, state, {
                isAdmin: action.payload
            });
        default:
            return state;
    }
};