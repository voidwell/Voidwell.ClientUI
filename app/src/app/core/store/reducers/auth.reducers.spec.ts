import { AuthUser } from '../../auth/auth-user.model';
import { authReducer } from './auth.reducers';
import { AuthActions, LoadUserFailure, RenewTokenSuccess, LoadUserSuccess, LogOutUser } from '../actions/auth.actions';

describe('authReducer', () => {
    const user = { accessToken: 'token', name: 'Test', roles: ['Blog'] } as AuthUser;

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

    it('exposes the roles of the user', () => {
        const state = authReducer(undefined, new LoadUserSuccess(user));
        expect(state.userRoles).toEqual(['Blog']);
    });

    it('sets an error on LoadUserFailure', () => {
        const state = authReducer(undefined, new LoadUserFailure({ error: 'x' }));
        expect(state.isAuthenticated).toBe(false);
        expect(state.errorMessage).toBe('Failed to load user.');
    });

    it('replaces the user on RenewTokenSuccess', () => {
        const loggedIn = authReducer(undefined, new LoadUserSuccess(user));
        const renewed = { ...user, accessToken: 'new', roles: ['Administrator'] };
        const state = authReducer(loggedIn, new RenewTokenSuccess(renewed));
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toBe(renewed);
        expect(state.userRoles).toEqual(['Administrator']);
    });

    it('resets on LogOutUser', () => {
        const loggedIn = authReducer(undefined, new LoadUserSuccess(user));
        const state = authReducer(loggedIn, new LogOutUser());
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
    });
});
