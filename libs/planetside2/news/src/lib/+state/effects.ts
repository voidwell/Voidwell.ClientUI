import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { forkJoin, of } from 'rxjs';
import { catchError, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { loadNewsPosts, loadNewsPostsFailure, loadNewsPostsSuccess } from './actions';
import { NewsComponent } from '../news.component';
import { getIsComponentActive, getPathParams } from '@voidwell/common/router';
import { NewsRepository } from '../news.repository';

@Injectable()
export class NewsEffects {
  initLoad$ = createEffect(() =>
    this.store.select(getIsComponentActive(NewsComponent)).pipe(
      filter(active => active),
      map(() => loadNewsPosts())
    ));

  loadPosts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadNewsPosts),
      switchMap(() =>
        forkJoin([this.repository.getNews(), this.repository.getUpdates()]).pipe(
          map(([newsPosts, updatePosts]) => loadNewsPostsSuccess({ newsPosts, updatePosts })),
          catchError((error) => of(loadNewsPostsFailure({ error })))
        )
      )
    )
  );

  constructor(private store: Store, private actions$: Actions, private repository: NewsRepository) {}
}
