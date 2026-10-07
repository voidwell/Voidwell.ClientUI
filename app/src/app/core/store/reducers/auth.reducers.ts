import { User } from 'oidc-client';
import { AuthActionTypes, AuthActions } from '../actions/auth.actions';

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    userRoles: string[];
    errorMessage: string | null;
}

const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    userRoles: [],
    errorMessage: null
};
  
export function authReducer(state = initialState, action: AuthActions): AuthState {
    switch (action.type) {
        case AuthActionTypes.LOAD_USER_SUCCESS: {
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload,
                errorMessage: null
            };
        }
        case AuthActionTypes.LOAD_USER_FAILURE: {
            return {
                ...initialState,
                errorMessage: 'Failed to load user.'
            };
        }
        case AuthActionTypes.LOAD_USER_ROLES_SUCCESS: {
            return {
                ...state,
                userRoles: action.payload
            };
        }
        case AuthActionTypes.LOAD_USER_ROLES_FAILURE: {
            return {
                ...state,
                errorMessage: 'Failed to load roles for user.',
            };
        }
        case AuthActionTypes.LOG_OUT_USER:
        case AuthActionTypes.RENEW_TOKEN_FAILURE: {
            return initialState;
        }
        default: {
            return state;
        }
    }
}
  