import { createAction, props } from '@ngrx/store';
import { BlogPost } from '../contracts/blogpost.model';

export const loadBlogPost = createAction('[Blog] Load Post', props<{ blogPostId: string }>())
export const loadBlogPostList = createAction('[Blog] Load Posts');
export const loadBlogPostsSuccess = createAction(
  '[Blog] Load Success',
  props<{ blogPosts: BlogPost[] }>()
);
export const loadBlogPostsFailure = createAction('[Blog] Load Failure', props<{ error: unknown }>());
