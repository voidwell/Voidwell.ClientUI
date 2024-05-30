import { createReducer, on } from "@ngrx/store";
import { BlogPost } from "../contracts/blogpost.model";
import { loadBlogPost, loadBlogPostList, loadBlogPostsFailure, loadBlogPostsSuccess } from "./actions";
import { LoadStatus } from '@voidwell/common/utils';

export interface BlogState {
  loadStatus: LoadStatus;
  error: unknown;
  blogPosts: BlogPost[];
}
  
export const initialState: BlogState = {
  loadStatus: LoadStatus.Pristine,
  error: undefined,
  blogPosts: [],
};

export const reducer = createReducer(
  initialState,
  on(loadBlogPost, loadBlogPostList, () => ({
    ...initialState,
    loadStatus: LoadStatus.Loading
  })),
  on(loadBlogPostsSuccess, (state, action) => ({
    ...state,
    loadStatus: LoadStatus.Loaded,
    blogPosts: action.blogPosts
  })),
  on(loadBlogPostsFailure, (state, action) => ({
    ...initialState,
    loadStatus: LoadStatus.Failed,
    error: action.error
  }))
);
