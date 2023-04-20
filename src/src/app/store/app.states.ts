import { createFeatureSelector } from '@ngrx/store';
import * as auth from './reducers/auth.reducers';
import * as registration from './reducers/registration.reducers';

export interface AppState {
    auth: auth.AuthState;
    registration: registration.RegistrationState;
}

export const reducers = {
    auth: auth.authReducer,
    registration: registration.registrationReducer
};

export const selectAuthState = createFeatureSelector<AppState, auth.AuthState>('auth');
export const selectRegistrationState = createFeatureSelector<AppState, registration.RegistrationState>('registration');