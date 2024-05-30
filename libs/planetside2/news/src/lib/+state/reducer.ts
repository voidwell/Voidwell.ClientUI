import { createReducer, on } from "@ngrx/store";
import { NewsPost } from "../contracts/news-post.model";
import { loadNewsPosts, loadNewsPostsFailure, loadNewsPostsSuccess } from "./actions";
import { LoadStatus } from '@voidwell/common/utils';

export interface NewsState {
  loadStatus: LoadStatus;
  error: unknown;
  newsPosts: NewsPost[];
  updatePosts: NewsPost[];
}
  
export const initialState: NewsState = {
  loadStatus: LoadStatus.Pristine,
  error: undefined,
  newsPosts: [],
  updatePosts: [],
};

export const reducer = createReducer(
  initialState,
  on(loadNewsPosts, () => ({
    ...initialState,
    loadStatus: LoadStatus.Loading
  })),
  on(loadNewsPostsSuccess, (state, action) => ({
    ...state,
    loadStatus: LoadStatus.Loaded,
    newsPosts: action.newsPosts,
    updatePosts: action.updatePosts
  })),
  on(loadNewsPostsFailure, (state, action) => ({
    ...initialState,
    loadStatus: LoadStatus.Failed,
    error: action.error
  }))
);
