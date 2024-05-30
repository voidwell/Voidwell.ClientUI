import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { loadBlogPost, loadBlogPostList, loadBlogPostsFailure, loadBlogPostsSuccess } from './actions';
import { BlogComponent } from '../blog.component';
import { getIsComponentActive, getPathParams } from '@voidwell/common/router';
import { BlogRepository } from '../blog.repository';

@Injectable()
export class BlogEffects {
  initLoad$ = createEffect(() =>
    this.store.select(getIsComponentActive(BlogComponent)).pipe(
      filter(active => active),
      switchMap(() => 
        this.store.select(getPathParams).pipe(
          map(params => params['blogPostId']),
          map(blogPostId => !!blogPostId ? loadBlogPost({ blogPostId }) : loadBlogPostList())
        ))
    ));

  loadPost$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadBlogPost),
      switchMap((action) =>
        this.repository.getBlogPost(action.blogPostId).pipe(
          map(response => loadBlogPostsSuccess({ blogPosts: [response] })),
          catchError((error) => of(loadBlogPostsFailure({ error })))
        )
      )
    )
  );

  loadPostList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadBlogPostList),
      switchMap(() =>
        this.repository.getAllBlogPosts().pipe(
          map(response => loadBlogPostsSuccess({ blogPosts: response })),
          catchError((error) => of(loadBlogPostsFailure({ error })))
        )
      )
    )
  );

  constructor(private store: Store, private actions$: Actions, private repository: BlogRepository) {}
}
