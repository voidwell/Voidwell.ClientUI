import { createAction, props } from '@ngrx/store';
import { NewsPost } from '../contracts/news-post.model';

export const loadNewsPosts = createAction('[News] Load Posts');
export const loadNewsPostsSuccess = createAction(
  '[News] Load Success',
  props<{ newsPosts: NewsPost[], updatePosts: NewsPost[] }>()
);
export const loadNewsPostsFailure = createAction('[News] Load Failure', props<{ error: unknown }>());
