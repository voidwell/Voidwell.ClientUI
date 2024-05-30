import { createSelector } from "@ngrx/store";
import { createFeatureSelector } from '@ngrx/store';
import { NewsState } from "./reducer";
import { PS2_NEWS_FEATURE_KEY } from "../constants";

export const getNewsState = createFeatureSelector<NewsState>(PS2_NEWS_FEATURE_KEY);

export const getNewsPosts = createSelector(getNewsState, (state) => state.newsPosts);
export const getUpdatePosts = createSelector(getNewsState, (state) => state.updatePosts);
export const getLoadStatus = createSelector(getNewsState, (state) => state.loadStatus);