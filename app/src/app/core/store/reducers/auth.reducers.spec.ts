import { User } from 'oidc-client';
import { authReducer } from './auth.reducers';
import { AuthActions, LoadUserFailure, LoadUserRolesSuccess, LoadUserSuccess, LogOutUser } from '../actions/auth.actions';

describe('authReducer', () => {
    const user = { access_token: 'token' } as User;

    it('starts unauthenticated', () => {
        const state = authReducer(undefined, { type: 'init' } as unknown as AuthActions);
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
    });

    it('stores the user on LoadUserSuccess', () => {
        const state = authReducer(undefined, new LoadUserSuccess(user));
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toBe(user);
    });

    it('stores roles on LoadUserRolesSuccess', () => {
        const state = authReducer(undefined, new LoadUserRolesSuccess(['admin']));
        expect(state.userRoles).toEqual(['admin']);
    });

    it('sets an error on LoadUserFailure', () => {
        const state = authReducer(undefined, new LoadUserFailure({ error: 'x' }));
        expect(state.isAuthenticated).toBe(false);
        expect(state.errorMessage).toBe('Failed to load user.');
    });

    it('resets on LogOutUser', () => {
        const loggedIn = authReducer(undefined, new LoadUserSuccess(user));
        const state = authReducer(loggedIn, new LogOutUser());
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
    });
});
