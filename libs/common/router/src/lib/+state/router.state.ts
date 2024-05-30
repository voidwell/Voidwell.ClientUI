import { Type } from '@angular/core';
import { Params } from '@angular/router';
import { BaseRouterStoreState } from '@ngrx/router-store';
import { ActivatedRouteSnapshotData } from './router.models';

export const ROUTER_FEATURE_KEY = 'common.router';

export interface RouterState extends BaseRouterStoreState {
  url: string;
  queryParams: Params;
  pathParams: Params;
  /** The array of activated routes sorted from root */
  pathFromRoot: ActivatedRouteSnapshotData[];
  getRoutesComponents: () => Type<unknown>[];
}
