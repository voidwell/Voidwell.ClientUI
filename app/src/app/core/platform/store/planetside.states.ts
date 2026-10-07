import { createFeatureSelector } from '@ngrx/store';
import { planetsideReducer, PlanetsideState } from './reducers/planetside.reducers';

export const reducers = {
    planetside: planetsideReducer
};

export const selectPlanetsideState = createFeatureSelector<PlanetsideState>('ps2');