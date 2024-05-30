import { Type } from '@angular/core';
import * as fromRouter from '@ngrx/router-store';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ROUTER_FEATURE_KEY, RouterState } from '../+state/router.state';

export const getRouter = createFeatureSelector<fromRouter.RouterReducerState<RouterState> | undefined>(
  ROUTER_FEATURE_KEY
);

export const getRouterState = createSelector(getRouter, router => router?.state || null);

export const getUrl = createSelector(getRouterState, state => state && state.url);

export const getRoutesComponents = createSelector(getRouterState, state => state && state.getRoutesComponents());

export const getIsComponentActive = (component: Type<unknown>) =>
  createSelector(
    getRoutesComponents,
    (routesComponents: Type<unknown>[] | null) => routesComponents?.some(x => x == component) || false
  );

export const getPathParams = createSelector(getRouterState, state => state?.pathParams || {});
export const getQueryParams = createSelector(getRouterState, state => state?.queryParams || {});

export const getActivatedRoute = createSelector(
  getRouterState,
  state =>
    (state?.pathFromRoot && state?.pathFromRoot?.length > 0 && state.pathFromRoot[state.pathFromRoot.length - 1]) ||
    null
);

export const getActivatedRoutesFromRoot = createSelector(getRouterState, state => state?.pathFromRoot || []);

export const getCurrentRouteAuthorized = createSelector(getActivatedRoutesFromRoot, routes => {
  if (routes?.length) {
    return routes[0]?.data?.authorized;
  }

  return null;
});
