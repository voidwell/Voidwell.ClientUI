import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, debounceTime, filter, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { changePlatform, changeSearchType, loadSearch, loadSearchFailure, loadSearchSuccess, updateSearchQuery } from './actions';
import { HubRepository } from '../hub.repository';
import { getPlatformType, getSearchQuery, getSearchType } from './selector';

@Injectable()
export class HubEffects {
  searchChanged$ = createEffect(() =>
    this.actions$.pipe(
      ofType(changePlatform, changeSearchType, updateSearchQuery),
      debounceTime(1000),
      withLatestFrom(this.store.select(getSearchQuery)),
      filter(([,searchQuery]) => searchQuery?.length >= 2),
      map(() => loadSearch())
    ));

  loadSearch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadSearch),
      withLatestFrom(this.store.select(getPlatformType), this.store.select(getSearchType), this.store.select(getSearchQuery)),
      switchMap(([_, platformType, searchType, searchQuery]) =>
        this.repository.search(platformType, searchType, searchQuery).pipe(
          map(response => loadSearchSuccess({ results: response })),
          catchError((error) => of(loadSearchFailure({ error })))
        )
      )
    )
  );

  constructor(private store: Store, private actions$: Actions, private repository: HubRepository) {}
}
