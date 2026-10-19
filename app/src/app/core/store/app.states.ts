import { createFeatureSelector } from '@ngrx/store';
import * as auth from './reducers/auth.reducers';
import { PlanetsideState, planetsideReducer } from '../platform/store/reducers/planetside.reducers';

export interface AppState {
    auth: auth.AuthState;
    ps2: PlanetsideState;
}

export const reducers = {
    auth: auth.authReducer,
    ps2: planetsideReducer
};

export const selectAuthState = createFeatureSelector<auth.AuthState>('auth');