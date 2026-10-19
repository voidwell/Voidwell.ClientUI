import { createFeatureSelector } from '@ngrx/store';
import { PlanetsideState } from './reducers/planetside.reducers';

/** The selected PlanetSide platform; registered on the root store so the navigation can show it on every page. */
export const selectPlanetsideState = createFeatureSelector<PlanetsideState>('ps2');
