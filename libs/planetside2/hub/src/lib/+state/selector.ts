import { createSelector } from "@ngrx/store";
import { createFeatureSelector } from '@ngrx/store';
import { PS2_HUB_FEATURE_KEY } from "../constants";
import { HubState } from "./reducer";

export const getState = createFeatureSelector<HubState>(PS2_HUB_FEATURE_KEY);

export const getPlatformType = createSelector(getState, (state) => state.platformType);
export const getSearchType = createSelector(getState, (state) => state.searchType);
export const getSearchQuery = createSelector(getState, (state) => state.searchQuery);
export const getSearchStatus = createSelector(getState, (state) => state.searchStatus);
export const getSearchResults = createSelector(getState, (state) => state.searchResults);
