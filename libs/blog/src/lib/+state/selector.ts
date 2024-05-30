import { createSelector } from "@ngrx/store";
import { createFeatureSelector } from '@ngrx/store';
import { BlogState } from "./reducer";
import { BLOG_FEATURE_KEY } from "../constants";

export const getBlogState = createFeatureSelector<BlogState>(BLOG_FEATURE_KEY);

export const getBlogPosts = createSelector(getBlogState, (state) => state.blogPosts);
export const getLoadStatus = createSelector(getBlogState, (state) => state.loadStatus);