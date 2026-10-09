import { AuthUser } from '../../auth/auth-user.model';
import { AuthActionTypes, AuthActions } from '../actions/auth.actions';

export interface AuthState {
    isAuthenticated: boolean;
    user: AuthUser | null;
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
                userRoles: action.payload.roles,
                errorMessage: null
            };
        }
        case AuthActionTypes.RENEW_TOKEN_SUCCESS: {
            return {
                ...state,
                user: action.payload,
                userRoles: action.payload.roles
            };
        }
        case AuthActionTypes.LOAD_USER_FAILURE: {
            return {
                ...initialState,
                errorMessage: 'Failed to load user.'
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
  