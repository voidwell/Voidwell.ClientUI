import { createAction, props } from '@ngrx/store';
import { PlatformType } from '../models/platform-type.model';
import { SearchType } from '../models/search-type.model';
import { SearchResult } from '../contracts/search-result.model';

export const changePlatform = createAction('[Hub] Change Platform', props<{ platformType: PlatformType }>());

export const changeSearchType = createAction('[Hub] Change Search Type', props<{ searchType: SearchType }>());
export const updateSearchQuery = createAction('[Hub] Change Search Query', props<{ searchQuery: string }>());
export const loadSearch = createAction('[Hub] Load Search');
export const loadSearchSuccess = createAction(
  '[Hub] Load Search Success',
  props<{ results: SearchResult[] }>()
);
export const loadSearchFailure = createAction('[Hub] Load Search Failure', props<{ error: unknown }>());
